defmodule FigmexWeb.UserSocket do
  use Phoenix.Socket

  ## Channels
  channel "room:*", FigmexWeb.RoomChannel

  @impl true
  def connect(params, socket, _connect_info) do
    {:ok, assign(socket, :user_id, params["user_id"])}
  end

  @impl true
  def id(socket), do: "users_socket:#{socket.assigns.user_id}"
end
