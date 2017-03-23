module Digraph.Json.Encode exposing (encodeDigraph)

import Digraph
import Dict
import Json.Encode as JE exposing (Value)
import BasicGeometry exposing (Point)


encodeDigraph : Digraph.Model -> Value
encodeDigraph { vertices, edges, scaleAndTranslate } =
    [ ( "vertices", encodeVertices vertices )
    , ( "edges", encodeEdges edges )
    , ( "scaleAndTranslate", encodeScaleAndTranslate scaleAndTranslate )
    ]
        |> JE.object


encodeScaleAndTranslate : { scale : Float, translate : Point } -> Value
encodeScaleAndTranslate { scale, translate } =
    [ ( "scale", JE.float scale )
    , ( "translate", encodePoint translate )
    ]
        |> JE.object


encodeMaybe : (a -> Value) -> Maybe a -> Value
encodeMaybe encoder maybeThing =
    case maybeThing of
        Nothing ->
            JE.null

        Just thing ->
            encoder thing


encodePoint : Point -> Value
encodePoint ( x, y ) =
    [ ( "x", JE.float x )
    , ( "y", JE.float y )
    ]
        |> JE.object


{-|
Digraph toString (This is also used for hashing, to diff from the last saved file.)
-}
toString : Digraph.Model -> String
toString digraph =
    JE.encode 2 (encodeDigraph digraph)



-- for vertices


encodeVertices vertices =
    vertices
        |> Dict.toList
        |> List.sortBy Tuple.first
        |> List.map encodeVertex
        |> JE.list


encodeVertex ( vertexName, vertexProp ) =
    [ ( "vertexName", JE.string vertexName )
    , ( "vertexProp", encodeVertexProp vertexProp )
    ]
        |> JE.object


encodeVertexProp ({ label, position, radius, color, hullId, force } as vertexProp) =
    [ ( "label", encodeMaybe JE.string label )
    , ( "position", encodePoint position )
    , ( "radius", JE.float radius )
    , ( "color", JE.string color )
    , ( "hullId", encodeMaybe JE.string hullId )
    , ( "force", encodeNodeForceData force )
    ]
        |> JE.object


encodeNodeForceData nodeForceData =
    [ ( "gC", encodeMaybe encodePoint nodeForceData.gC )
    , ( "pullStrengthTogC", JE.float nodeForceData.pullStrengthTogC )
    , ( "fixed", JE.bool nodeForceData.fixed )
    , ( "charge", JE.float nodeForceData.charge )
    ]
        |> JE.object



-- for edges


encodeEdges edges =
    edges
        |> Dict.toList
        |> List.sortBy Tuple.first
        |> List.map encodeEdge
        |> JE.list


encodeEdge ( edgeId, edgeProp ) =
    [ ( "edgeId", encodeEdgeId edgeId )
    , ( "edgeProp", encodeEdgeProp edgeProp )
    ]
        |> JE.object


encodeEdgeId edgeId =
    [ ( "source", JE.string (Tuple.first edgeId) )
    , ( "target", JE.string (Tuple.second edgeId) )
    ]
        |> JE.object


encodeEdgeProp ({ color, thickness, shape, force } as edgeProp) =
    [ ( "color", JE.string color )
    , ( "thickness", JE.float thickness )
    , ( "shape", encodeEdgeShape shape )
    , ( "force", encodeLinkForceData force )
    ]
        |> JE.object


encodeEdgeShape edgeShape =
    case edgeShape of
        Digraph.Standard ->
            JE.string "Standard"

        Digraph.Arrowed ->
            JE.string "Arrowed"

        Digraph.Arc ->
            JE.string "Arc"


encodeLinkForceData linkForceData =
    [ ( "strength", JE.float linkForceData.strength )
    , ( "distance", JE.float linkForceData.distance )
    ]
        |> JE.object
