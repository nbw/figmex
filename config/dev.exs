import Config

import_config "dev.phoenix.exs"

config :libcluster,
  topologies: [
    local_cluster: [
      strategy: Cluster.Strategy.Gossip
    ]
  ]
