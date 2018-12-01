module Algorithms.Dijkstra.Viz exposing (toMyGraph)

import Algorithms.Dijkstra exposing (InputData, StepData)
import Dict exposing (Dict)
import Graph
import GraphFile exposing (MyGraph)


toMyGraph : InputData -> StepData -> MyGraph
toMyGraph inputData stepData =
    Graph.empty
