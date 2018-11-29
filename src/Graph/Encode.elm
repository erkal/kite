module Graph.Encode exposing (graph)

import Graph exposing (Edge, Graph, Node)
import Json.Encode as JE exposing (Value)


graph : (n -> Value) -> (e -> Value) -> Graph n e -> Value
graph nodeLabel edgeLabel g =
    JE.object
        [ ( "nodes", nodes nodeLabel (Graph.nodes g) )
        , ( "edges", edges edgeLabel (Graph.edges g) )
        ]


nodes : (n -> Value) -> List (Node n) -> Value
nodes nodeLabel ns =
    JE.list (node nodeLabel) ns


node : (n -> Value) -> Node n -> Value
node nodeLabel { id, label } =
    JE.object
        [ ( "id", JE.int id )
        , ( "label", nodeLabel label )
        ]


edges : (e -> Value) -> List (Edge e) -> Value
edges edgeLabel es =
    JE.list (edge edgeLabel) es


edge : (e -> Value) -> Edge e -> Value
edge edgeLabel { from, to, label } =
    JE.object
        [ ( "from", JE.int from )
        , ( "to", JE.int to )
        , ( "label", edgeLabel label )
        ]
