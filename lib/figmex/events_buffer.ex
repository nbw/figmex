defmodule Figmex.EventsBuffer do
  @moduledoc """
  Stores events in a buffer. The buffer is flushed (broadcasted)
  at a constant interval.

  The purpose of this module is to throttle websocket events from
  all users on the node into a single broadcasted data stream.
  """
  use GenServer

  alias Figmex.StateStore
  alias FigmexWeb.PubSub

  @name :"room:buffer"

  def start_link(_default) do
    GenServer.start_link(__MODULE__, %{}, name: @name)
  end

  def update(%{"id" => _id} = e) do
    GenServer.cast(self_pid(), {:update, e})
  end

  def reset() do
    GenServer.cast(self_pid(), :reset)
  end

  @impl true
  def init(default) do
    flush_events()
    {:ok, default}
  end

  @impl true
  def handle_info(:flush_events, state) when state == %{} do
    flush_events()
    {:noreply, state}
  end

  @impl true
  def handle_info(:flush_events, state) do
    broadcast(state)
    flush_events()
    save_non_cursor_events(state)
    {:noreply, %{}}
  end

  @impl true
  def handle_cast(
        {:update,
         %{
           "id" => id
         } = updates},
        state
      ) do
    result =
      Map.get(state, id, %{})
      |> Map.merge(Map.delete(updates, "id"))

    state = Map.put(state, id, result)

    {:noreply, state}
  end

  @impl true
  def handle_cast(:update, _), do: {:noreply, %{}}

  @impl true
  def handle_cast(:reset, _), do: {:noreply, %{}}

  defp self_pid, do: Process.whereis(@name)

  defp flush_events do
    Process.send_after(self(), :flush_events, 25)
  end

  defp broadcast(state) do
    PubSub.broadcast(FigmexWeb.RoomChannel.name(), {:update, state})
  end

  defp save_non_cursor_events(state) do
    filtered_state = Map.reject(state, fn {_k, v} -> v["type"] == "cursor" end)

    StateStore.update(:board, filtered_state)
  end
end
