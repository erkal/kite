module Digraph.Examples.HyperCubes exposing (..)

import Digraph
import Digraph.Generators.Basic exposing (fromAbstractDigraph)
import Digraph.Generators.Hypercube


create : Int -> Digraph.Model
create d =
    Digraph.Generators.Hypercube.hypercube d
        |> Digraph.Generators.Basic.fromAbstractDigraph
