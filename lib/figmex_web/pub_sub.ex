defmodule FigmexWeb.PubSub do
  alias Phoenix.PubSub

  def subscribe(topic) do
    PubSub.subscribe(Figmex.PubSub, topic)
  end

  def broadcast(topic, data) do
    PubSub.broadcast(Figmex.PubSub, topic, data)
  end
end
