defmodule Figmex.StateStore do
  @moduledoc """
  Stores the board state in app memory.

  The board "state" is used to populate the
  initial state of the board.

  Configured with a "global" name, so one instance
  exists across all nodes. This isn't my favorite solution,
  but minimizes race conditions for now.
  """

  use GenServer
  alias FigmexWeb.PubSub

  @name {:global, __MODULE__}
  @reset_minutes 60
  @initial_state %{board: %{}, claims: %{}, reset_at: nil}

  def start_link(opts) do
    if Enum.member?(:global.registered_names(), __MODULE__) do
      :ignore
    else
      opts = Keyword.put(opts, :name, @name)
      GenServer.start_link(__MODULE__, :ok, opts)
    end
  end

  def start({:error, {:already_started, _pid}}), do: :ignore
  def start(s), do: s

  @impl true
  def init(_state) do
    # Subscribe to events to track when a user leaves, at which
    # point any stale data should be pruned
    PubSub.subscribe(FigmexWeb.RoomChannel.name())

    scheduled_reset()

    {:ok, @initial_state}
  end

  def scheduled_reset() do
    Process.send_after(self(), :maybe_reset, :timer.seconds(15))
  end

  def reset do
    GenServer.call(@name, :reset)
  end

  def get do
    GenServer.call(@name, :get)
  end

  def get(key) do
    GenServer.call(@name, {:get, key})
  end

  def update(key, delta) do
    GenServer.cast(@name, {:update, key, delta})
  end

  def delete(key, id) do
    GenServer.cast(@name, {:delete, key, id})
  end

  @impl true
  def handle_call(:get, _from, state) do
    {:reply, state, state}
  end

  @impl true
  def handle_call({:get, key}, _from, state) do
    {:reply, Map.get(state, key, @initial_state), state}
  end

  @impl true
  def handle_call(:reset, _from, state) do
    {:reply, state, @initial_state}
  end

  @impl true
  def handle_cast({:update, key, delta}, state) do
    value =
      Map.get(state, key, @initial_state)
      |> Map.merge(delta)

    {:noreply, Map.put(state, key, value)}
  end

  @impl true
  def handle_cast({:delete, key, id}, state) do
    value =
      Map.get(state, key, @initial_state)
      |> Map.delete(id)

    {:noreply, Map.put(state, key, value)}
  end

  @impl true
  def handle_info(:maybe_reset, %{reset_at: nil} = state) do
    scheduled_reset()
    {:noreply, Map.put(state, :reset_at, DateTime.now!("Etc/UTC"))}
  end

  @impl true
  def handle_info(:maybe_reset, %{reset_at: reset_at} = state) do
    ms_diff = DateTime.diff(DateTime.now!("Etc/UTC"), reset_at, :millisecond)

    state =
      if ms_diff > :timer.minutes(@reset_minutes) do
        PubSub.broadcast(FigmexWeb.RoomChannel.name(), :reset)
        @initial_state
      else
        PubSub.broadcast(
          FigmexWeb.RoomChannel.name(),
          {:update_timer, reset_at}
        )

        state
      end

    scheduled_reset()

    {:noreply, state}
  end

  @impl true
  def handle_info(%{event: "presence_diff", payload: payload}, socket) do
    # When a user leaves, clear any claims they had
    Map.fetch!(payload, :leaves)
    |> Map.keys()
    |> Enum.each(fn user_id ->
      delete(:claims, user_id)
    end)

    {:noreply, socket}
  end

  def handle_info(_, socket), do: {:noreply, socket}
end
