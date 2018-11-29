module Graph.Decode exposing (graph)

import Graph exposing (Edge, Graph, Node)
import Json.Decode as JD exposing (Decoder, Value)


graph : Decoder n -> Decoder e -> Decoder (Graph n e)
graph nodeLabel edgeLabel =
    JD.map2 Graph.fromNodesAndEdges
        (nodeList nodeLabel)
        (edgeList edgeLabel)


nodeList : Decoder n -> Decoder (List (Node n))
nodeList nodeLabel =
    JD.list (node nodeLabel)


node : Decoder n -> Decoder (Node n)
node nodeLabel =
    JD.map2 Node
        (JD.field "id" JD.int)
        (JD.field "label" nodeLabel)


edgeList : Decoder e -> Decoder (List (Edge e))
edgeList edgeLabel =
    JD.list (edge edgeLabel)


edge : Decoder e -> Decoder (Edge e)
edge edgeLabel =
    JD.map3 Edge
        (JD.field "from" JD.int)
        (JD.field "to" JD.int)
        (JD.field "label" edgeLabel)
