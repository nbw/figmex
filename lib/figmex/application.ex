defmodule Figmex.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    children = [
      # Start the Ecto repository
      # Figmex.Repo,
      # Start the Telemetry supervisor
      FigmexWeb.Telemetry,
      # Start the PubSub system
      {Phoenix.PubSub, name: Figmex.PubSub},
      FigmexWeb.Presence,
      # Start the Endpoint (http/https)
      FigmexWeb.Endpoint,
      Figmex.EventsBuffer,
      # Start a worker by calling: Figmex.Worker.start_link(arg)
      # {Figmex.Worker, arg}
      {Cluster.Supervisor, [topologies(), [name: Figmex.ClusterSupervisor]]},
      Figmex.StateStore
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: Figmex.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  @impl true
  def config_change(changed, _new, removed) do
    FigmexWeb.Endpoint.config_change(changed, removed)
    :ok
  end

  defp topologies do
    Application.get_env(:libcluster, :topologies) || []
  end
end
