defmodule Figmex.Repo do
  use Ecto.Repo,
    otp_app: :figmex,
    adapter: Ecto.Adapters.Postgres
end
