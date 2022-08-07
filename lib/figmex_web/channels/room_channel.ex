defmodule FigmexWeb.RoomChannel do
  @moduledoc """
  Handles all webhook traffic between the client and the backend.
  """

  use Phoenix.Channel

  alias FigmexWeb.Presence

  alias Figmex.{
    EventsBuffer,
    Permissions,
    StateStore
  }

  @channel_name "room:lobby"

  def join(@channel_name, _message, socket) do
    send(self(), :after_join)
    {:ok, socket}
  end

  def join("room:" <> _private_room_id, _params, _socket) do
    {:error, %{reason: "unauthorized"}}
  end

  def handle_in("object:create", %{"id" => obj_id} = params, socket) do
    Permissions.claim(socket, socket.assigns.user_id, obj_id, DateTime.utc_now())

    save_object_create(params)

    params = Map.put(params, "user_id", socket.assigns.user_id)

    broadcast!(socket, "create:object", params)
    {:noreply, socket}
  end

  def handle_in("object:update", params, socket) do
    EventsBuffer.update(params)
    {:noreply, socket}
  end

  def handle_in("object:delete", %{"obj_id" => obj_id} = params, socket) do
    broadcast!(socket, "delete:object", params)
    Permissions.delete_claim(socket, socket.assigns.user_id, obj_id)
    StateStore.delete(:board, obj_id)

    {:noreply, socket}
  end

  def handle_in("claim:new", params, socket) do
    Permissions.claim(socket, socket.assigns.user_id, params["obj_id"], DateTime.utc_now())
    {:noreply, socket}
  end

  def handle_in("claim:delete", params, socket) do
    Permissions.delete_claim(socket, socket.assigns.user_id, params["obj_id"])

    {:noreply, socket}
  end

  def handle_in("reset", _params, socket) do
    StateStore.reset()
    EventsBuffer.reset()
    broadcast!(socket, "reset", %{})

    {:noreply, socket}
  end

  def handle_info({:update_timer, reset_at}, socket) do
    push(socket, "update_timer", %{reset_at: reset_at})

    {:noreply, socket}
  end

  def handle_info(:reset, socket) do
    EventsBuffer.reset()
    push(socket, "reset", %{})

    {:noreply, socket}
  end

  def handle_info(:after_join, socket) do
    {:ok, _} =
      Presence.track(socket, socket.assigns.user_id, %{
        id: socket.assigns.user_id,
        region: region(),
        online_at: inspect(System.system_time(:second))
      })

    push(socket, "users:load", Presence.list(socket))

    {:noreply, socket}
  end

  def handle_info({:update, data}, socket) do
    broadcast!(socket, "update", data)

    {:noreply, socket}
  end

  def name, do: @channel_name

  defp region do
    System.get_env("FLY_REGION") || String.slice(Atom.to_string(Node.self()), 0..2)
  end

  defp save_object_create(%{"id" => obj_id} = params) do
    StateStore.update(:board, Map.new([{obj_id, Map.delete(params, "id")}]))
  end
end
