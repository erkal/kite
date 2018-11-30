module Graph.Decode exposing (graph)

import Graph exposing (Edge, Graph, Node)
import Json.Decode as JD exposing (Decoder, Value)


graph : Decoder n -> Decoder e -> Decoder (Graph n e)
graph nodeLabel edgeLabel =
    JD.map2 Graph.fromNodesAndEdges
        (JD.field "nodes" (JD.list (node nodeLabel)))
        (JD.field "edges" (JD.list (edge edgeLabel)))


node : Decoder n -> Decoder (Node n)
node nodeLabel =
    JD.map2 Node
        (JD.field "id" JD.int)
        (JD.field "label" nodeLabel)


edge : Decoder e -> Decoder (Edge e)
edge edgeLabel =
    JD.map3 Edge
        (JD.field "from" JD.int)
        (JD.field "to" JD.int)
        (JD.field "label" edgeLabel)
