module Graph.Encode exposing (graph)

import Graph exposing (Edge, Graph, Node)
import Json.Encode as JE exposing (Value)


graph : (n -> Value) -> (e -> Value) -> Graph n e -> Value
graph nodeLabel edgeLabel g =
    JE.object
        [ ( "nodes", JE.list (node nodeLabel) (Graph.nodes g) )
        , ( "edges", JE.list (edge edgeLabel) (Graph.edges g) )
        ]


node : (n -> Value) -> Node n -> Value
node nodeLabel { id, label } =
    JE.object
        [ ( "id", JE.int id )
        , ( "label", nodeLabel label )
        ]


edge : (e -> Value) -> Edge e -> Value
edge edgeLabel { from, to, label } =
    JE.object
        [ ( "from", JE.int from )
        , ( "to", JE.int to )
        , ( "label", edgeLabel label )
        ]
