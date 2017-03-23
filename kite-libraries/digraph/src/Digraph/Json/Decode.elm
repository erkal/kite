module Digraph.Json.Decode exposing (digraphDecoder)

import Digraph exposing (VertexProp, NodeForceData, LinkForceData, EdgeShape, EdgeProp)
import Dict exposing (Dict)
import Json.Decode exposing (..)
import Json.Decode.Pipeline exposing (..)
import BasicGeometry exposing (Point)


digraphDecoder : Decoder Digraph.Model
digraphDecoder =
    decode Digraph.Model
        |> required "vertices" verticesDecoder
        |> required "edges" edgesDecoder
        |> required "scaleAndTranslate" scaleAndTranslateDecoder


verticesDecoder : Decoder (Dict String VertexProp)
verticesDecoder =
    vertexDecoder
        |> map (\{ vertexName, vertexProp } -> ( vertexName, vertexProp ))
        |> list
        |> map Dict.fromList


pointDecoder : Decoder Point
pointDecoder =
    decode (,)
        |> required "x" float
        |> required "y" float


type alias Vertex =
    { vertexName : String
    , vertexProp : VertexProp
    }


vertexDecoder : Decoder { vertexName : String, vertexProp : VertexProp }
vertexDecoder =
    decode Vertex
        |> required "vertexName" string
        |> required "vertexProp" vertexPropDecoder


vertexPropDecoder : Decoder VertexProp
vertexPropDecoder =
    decode VertexProp
        |> required "label" (maybe string)
        |> required "position" pointDecoder
        |> required "radius" float
        |> required "color" string
        |> required "hullId" (maybe string)
        |> required "force" nodeForceDataDecoder


nodeForceDataDecoder : Decoder NodeForceData
nodeForceDataDecoder =
    decode NodeForceData
        |> required "gC" (maybe pointDecoder)
        |> required "pullStrengthTogC" float
        |> required "fixed" bool
        |> required "charge" float


edgesDecoder : Decoder (Dict ( String, String ) EdgeProp)
edgesDecoder =
    edgeDecoder
        |> map (\{ edgeId, edgeProp } -> ( edgeId, edgeProp ))
        |> list
        |> map Dict.fromList


type alias Edge =
    { edgeId : ( String, String )
    , edgeProp : EdgeProp
    }


edgeDecoder : Decoder Edge
edgeDecoder =
    decode Edge
        |> required "edgeId" edgeIdDecoder
        |> required "edgeProp" edgePropDecoder


type alias EdgeId =
    { source : String
    , target : String
    }


edgeIdDecoder : Decoder ( String, String )
edgeIdDecoder =
    decode EdgeId
        |> required "source" string
        |> required "target" string
        |> map (\{ source, target } -> ( source, target ))


edgePropDecoder : Decoder EdgeProp
edgePropDecoder =
    decode EdgeProp
        |> required "color" string
        |> required "thickness" float
        |> required "shape" edgeShapeDecoder
        |> required "force" linkForceDataDecoder


edgeShapeDecoder : Decoder EdgeShape
edgeShapeDecoder =
    string
        |> map
            (\edgeShape ->
                if edgeShape == "Standard" then
                    Digraph.Standard
                else if edgeShape == "Arrowed" then
                    Digraph.Arrowed
                else if edgeShape == "Arc" then
                    Digraph.Arc
                else
                    Digraph.Standard
            )


linkForceDataDecoder : Decoder LinkForceData
linkForceDataDecoder =
    decode LinkForceData
        |> required "strength" float
        |> required "distance" float


type alias ScaleAndTranslate =
    { scale : Float
    , translate : Point
    }


scaleAndTranslateDecoder : Decoder ScaleAndTranslate
scaleAndTranslateDecoder =
    decode ScaleAndTranslate
        |> required "scale" float
        |> required "translate" pointDecoder
