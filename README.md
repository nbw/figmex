![logo](/priv/static/images/banner.png)

# Figmex

A proof of concept to make a distributed Figma with Elixir.

Try it here:

https://figmex.nathanwillson.com

# About

[Read the blog post](https://nathanwillson.com/blog/posts/2022-09-03-figmex/)

# Usage

If you'd like to use Figmex locally, you'll need to install Elixir. I'd suggest using asdf for that.

```
# install dependencies
mix deps.get

# install js dependencies
mix setup

# start the server
mix phx.server

# server should be available at http://localhost:4000
```

## Using Clustered Nodes Locally

Start the first node:

```
PORT=4000 iex --sname abc@localhost -S mix phx.server
```

Start a second node:

```
PORT=4001 iex --sname xyz@localhost -S mix phx.server
```
