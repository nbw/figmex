defmodule FigmexWeb.Presence do
  use Phoenix.Presence,
    otp_app: :figmex,
    pubsub_server: Figmex.PubSub

  def user_count(topic) do
    __MODULE__.list(topic)
    |> Map.keys()
    |> length
  end
end
