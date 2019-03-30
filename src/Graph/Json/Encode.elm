module Graph.Json.Encode exposing (encode)

import Graph exposing (Edge, Graph, Node)
import Json.Encode as JE exposing (Value)


encode : (n -> Value) -> (e -> Value) -> Graph n e -> Value
encode nodeLabel edgeLabel g =
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
