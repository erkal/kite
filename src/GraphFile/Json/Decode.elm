module GraphFile.Json.Decode exposing (decode)

import Colors
import Dict
import Graph.Json.Decode
import GraphFile as GF exposing (BagDict, BagId, BagProperties, EdgeProperties, GraphFile, KiteGraph, LabelPosition(..), VertexProperties)
import Json.Decode as JD exposing (Decoder)
import Json.Decode.Pipeline as JDP
import Point2d exposing (Point2d)
import Set
import Vector2d exposing (Vector2d)


decode : Decoder GraphFile
decode =
    JD.map4
        (\a b c d ->
            GF.new
                { graph = a
                , bags = b
                , defaultVertexProperties = c
                , defaultEdgeProperties = d
                }
        )
        (JD.field "graph" kiteGraph)
        (JD.field "bags" bags)
        (JD.field "defaultVertexProperties" vertexProperties)
        (JD.field "defaultEdgeProperties" edgeProperties)


kiteGraph : Decoder KiteGraph
kiteGraph =
    Graph.Json.Decode.decode
        vertexProperties
        edgeProperties


bags : Decoder BagDict
bags =
    JD.map Dict.fromList (JD.list bag)


bag : Decoder ( BagId, BagProperties )
bag =
    JD.map2 Tuple.pair
        (JD.field "bagId" JD.int)
        (JD.field "bagProperties" bagProperties)


bagProperties : Decoder BagProperties
bagProperties =
    JD.map3 BagProperties
        (JD.field "label" JD.string)
        (JD.field "color" Colors.decoder)
        (JD.field "hasConvexHull" JD.bool)


vertexProperties : Decoder VertexProperties
vertexProperties =
    JD.succeed VertexProperties
        |> JDP.required "label" JD.string
        |> JDP.required "labelSize" JD.float
        |> JDP.required "labelPosition" labelPosition
        |> JDP.required "labelColor" Colors.decoder
        |> JDP.required "labelIsVisible" JD.bool
        |> JDP.required "position" point2d
        |> JDP.required "velocity" vector2d
        |> JDP.required "manyBodyStrength" JD.float
        |> JDP.required "gravityCenter" point2d
        |> JDP.required "gravityStrengthX" JD.float
        |> JDP.required "gravityStrengthY" JD.float
        |> JDP.required "fixed" JD.bool
        |> JDP.required "color" Colors.decoder
        |> JDP.required "radius" JD.float
        |> JDP.required "borderColor" Colors.decoder
        |> JDP.required "borderWidth" JD.float
        |> JDP.required "opacity" JD.float
        |> JDP.required "inBags" (JD.map Set.fromList (JD.list JD.int))


labelPosition : Decoder LabelPosition
labelPosition =
    JD.map
        (\str ->
            case str of
                "LabelTopLeft" ->
                    LabelTopLeft

                "LabelTop" ->
                    LabelTop

                "LabelTopRight" ->
                    LabelTopRight

                "LabelLeft" ->
                    LabelLeft

                "LabelCenter" ->
                    LabelCenter

                "LabelRight" ->
                    LabelRight

                "LabelBottomLeft" ->
                    LabelBottomLeft

                "LabelBottom" ->
                    LabelBottom

                "LabelBottomRight" ->
                    LabelBottomRight

                _ ->
                    -- This never happens
                    LabelBottomLeft
        )
        JD.string


edgeProperties : Decoder EdgeProperties
edgeProperties =
    JD.succeed EdgeProperties
        |> JDP.required "label" JD.string
        |> JDP.required "labelSize" JD.float
        |> JDP.required "labelColor" Colors.decoder
        |> JDP.required "labelIsVisible" JD.bool
        |> JDP.required "distance" JD.float
        |> JDP.required "strength" JD.float
        |> JDP.required "thickness" JD.float
        |> JDP.required "color" Colors.decoder
        |> JDP.required "opacity" JD.float


point2d : Decoder Point2d
point2d =
    JD.map Point2d.fromCoordinates <|
        JD.map2 Tuple.pair
            (JD.field "xCoordinate" JD.float)
            (JD.field "yCoordinate" JD.float)


vector2d : Decoder Vector2d
vector2d =
    JD.map Vector2d.fromComponents <|
        JD.map2 Tuple.pair
            (JD.field "xComponent" JD.float)
            (JD.field "yComponent" JD.float)
