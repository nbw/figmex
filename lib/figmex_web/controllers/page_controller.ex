defmodule FigmexWeb.PageController do
  use FigmexWeb, :controller

  alias Figmex.StateStore

  def index(conn, _params) do
    render(conn, "index.html")
  end

  def load(conn, _params) do
    json(conn, StateStore.get())
  end
end
