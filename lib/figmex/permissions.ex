defmodule Figmex.Permissions do
  @moduledoc """
  Resolves "claims" over objects on the board.

  Originally this was a Genserver, but was converted to
  simply piggyback on Presence APIs.
  """

  alias FigmexWeb.Presence
  alias Figmex.StateStore

  @doc """
  Check's other users to see if any of them have already
  claimed the object.
  """
  def claim(socket, user_id, obj_id, timestamp) do
    %{metas: [meta]} = Presence.get_by_key(socket, user_id)

    new_meta =
      meta
      |> Map.put(:claim, obj_id)
      |> Map.put(:claim_timestamp, timestamp)

    gather_claims(socket)
    |> Enum.filter(fn %{claim: claim} -> claim == obj_id end)
    |> case do
      [] ->
        Presence.update(socket, user_id, new_meta)
        StateStore.update(:claims, Map.new([{user_id, obj_id}]))

      claims ->
        final_meta =
          [new_meta | claims]
          |> Enum.sort(&(DateTime.compare(&1[:claim_timestamp], &2[:claim_timestamp]) != :gt))
          |> List.first()

        StateStore.update(:claims, Map.new([{final_meta[:id], obj_id}]))

        Presence.update(socket, final_meta[:id], final_meta)
    end
  end

  @doc false
  def delete_claim(socket, user_id, obj_id) do
    %{metas: [meta]} = Presence.get_by_key(socket, user_id)

    if meta[:claim] == obj_id do
      new_meta =
        meta
        |> Map.put(:claim, nil)
        |> Map.put(:claim_timestamp, nil)

      StateStore.delete(:claims, user_id)

      Presence.update(socket, user_id, new_meta)
    end
  end

  def gather_claims(socket) do
    Presence.list(socket)
    |> Stream.flat_map(fn
      {_, %{metas: metas}} ->
        metas
    end)
    |> Enum.filter(fn meta -> Map.has_key?(meta, :claim) end)
  end
end
