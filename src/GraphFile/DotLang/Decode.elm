module GraphFile.DotLang.Decode exposing (fromDot)

import Colors
import Dict
import DotLang exposing (Attr(..), AttrStmtType(..), Dot(..), EdgeRHS(..), ID(..), NodeId(..), Stmt(..))
import Graph exposing (Node)
import GraphFile as GF exposing (Bag, BagDict, BagId, BagProperties, EdgeProperties, GraphFile, KiteGraph, LabelPosition(..), VertexProperties)
import Json.Decode as JD exposing (Error)
import Point2d exposing (Point2d)
import Set
import Vector2d exposing (Vector2d)


fromDot : Dot -> GraphFile
fromDot (Dot _ _ stmtList) =
    let
        defaultVertexProperties =
            stmtList
                |> List.filterMap
                    (\stmt ->
                        case stmt of
                            AttrStmt AttrNode attrList ->
                                Just (vertexProperties GF.kitesDefaultVertexProp attrList)

                            _ ->
                                Nothing
                    )
                |> List.head
                |> Maybe.withDefault GF.kitesDefaultVertexProp

        defaultEdgeProperties =
            stmtList
                |> List.filterMap
                    (\stmt ->
                        case stmt of
                            AttrStmt AttrEdge attrList ->
                                Just (edgeProperties GF.kitesDefaultEdgeProp attrList)

                            _ ->
                                Nothing
                    )
                |> List.head
                |> Maybe.withDefault GF.kitesDefaultEdgeProp

        sortIn stmt p =
            case stmt of
                NodeStmt (NodeId (ID id) _) attrList ->
                    { p
                        | nodes =
                            { id = String.toInt id |> Maybe.withDefault 0
                            , label = vertexProperties defaultVertexProperties attrList
                            }
                                :: p.nodes
                    }

                EdgeStmtNode (NodeId (ID from) _) (EdgeNode (NodeId (ID to) _)) _ attrList ->
                    { p
                        | edges =
                            { from = String.toInt from |> Maybe.withDefault 0
                            , to = String.toInt to |> Maybe.withDefault 0
                            , label = edgeProperties defaultEdgeProperties attrList
                            }
                                :: p.edges
                    }

                AttrStmt AttrGraph _ ->
                    { p
                        | bags =
                            -- TODO
                            p.bags
                    }

                _ ->
                    p

        r =
            List.foldl sortIn { nodes = [], edges = [], bags = Dict.empty } stmtList
    in
    GF.new
        { graph = Graph.fromNodesAndEdges r.nodes r.edges
        , bags = r.bags
        , defaultVertexProperties = defaultVertexProperties
        , defaultEdgeProperties = defaultEdgeProperties
        }


vertexProperties : VertexProperties -> List Attr -> VertexProperties
vertexProperties default =
    let
        assign (Attr key value) vP =
            case ( key, value ) of
                ( ID "label", ID v ) ->
                    { vP | label = v }

                ( ID "labelSize", ID v ) ->
                    { vP | labelSize = String.toFloat v |> Maybe.withDefault default.labelSize }

                ( ID "labelPosition", ID v ) ->
                    { vP | labelPosition = labelPosition v }

                ( ID "labelColor", ID v ) ->
                    { vP | labelColor = JD.decodeString Colors.decoder v |> Result.withDefault default.labelColor }

                ( ID "labelIsVisible", ID v ) ->
                    { vP | labelIsVisible = JD.decodeString JD.bool v |> Result.withDefault default.labelIsVisible }

                ( ID "position", ID v ) ->
                    { vP | position = point2d v |> Maybe.withDefault default.position }

                ( ID "velocity", ID v ) ->
                    { vP | velocity = vector2d v |> Maybe.withDefault default.velocity }

                ( ID "manyBodyStrength", ID v ) ->
                    { vP | manyBodyStrength = String.toFloat v |> Maybe.withDefault default.manyBodyStrength }

                ( ID "gravityCenter", ID v ) ->
                    { vP | gravityCenter = point2d v |> Maybe.withDefault default.gravityCenter }

                ( ID "gravityStrengthX", ID v ) ->
                    { vP | gravityStrengthX = String.toFloat v |> Maybe.withDefault default.gravityStrengthX }

                ( ID "gravityStrengthY", ID v ) ->
                    { vP | gravityStrengthY = String.toFloat v |> Maybe.withDefault default.gravityStrengthY }

                ( ID "fixed", ID v ) ->
                    { vP | fixed = JD.decodeString JD.bool v |> Result.withDefault default.fixed }

                ( ID "color", ID v ) ->
                    { vP | color = JD.decodeString Colors.decoder v |> Result.withDefault default.color }

                ( ID "radius", ID v ) ->
                    { vP | radius = String.toFloat v |> Maybe.withDefault default.radius }

                ( ID "borderColor", ID v ) ->
                    { vP | borderColor = JD.decodeString Colors.decoder v |> Result.withDefault default.borderColor }

                ( ID "borderWidth", ID v ) ->
                    { vP | borderWidth = String.toFloat v |> Maybe.withDefault default.borderWidth }

                ( ID "opacity", ID v ) ->
                    { vP | opacity = String.toFloat v |> Maybe.withDefault default.opacity }

                ( ID "inBags", ID v ) ->
                    { vP
                        | inBags =
                            JD.decodeString (JD.list JD.int) v
                                |> Result.withDefault []
                                |> Set.fromList
                    }

                _ ->
                    vP
    in
    List.foldl assign default


point2d : String -> Maybe Point2d
point2d =
    JD.decodeString
        (JD.map2 Tuple.pair
            (JD.field "xCoordinate" JD.float)
            (JD.field "yCoordinate" JD.float)
        )
        >> Result.toMaybe
        >> Maybe.map Point2d.fromCoordinates


vector2d : String -> Maybe Vector2d
vector2d =
    JD.decodeString
        (JD.map2 Tuple.pair
            (JD.field "xComponent" JD.float)
            (JD.field "yComponent" JD.float)
        )
        >> Result.toMaybe
        >> Maybe.map Vector2d.fromComponents


labelPosition : String -> LabelPosition
labelPosition str =
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



--


edgeProperties : EdgeProperties -> List Attr -> EdgeProperties
edgeProperties default =
    let
        assign (Attr key value) eP =
            case ( key, value ) of
                ( ID "label", ID v ) ->
                    { eP | label = v }

                ( ID "labelSize", ID v ) ->
                    { eP | labelSize = String.toFloat v |> Maybe.withDefault default.labelSize }

                ( ID "labelColor", ID v ) ->
                    { eP | labelColor = JD.decodeString Colors.decoder v |> Result.withDefault default.labelColor }

                ( ID "labelIsVisible", ID v ) ->
                    { eP | labelIsVisible = JD.decodeString JD.bool v |> Result.withDefault default.labelIsVisible }

                ( ID "distance", ID v ) ->
                    { eP | distance = String.toFloat v |> Maybe.withDefault default.distance }

                ( ID "strength", ID v ) ->
                    { eP | strength = String.toFloat v |> Maybe.withDefault default.strength }

                ( ID "thickness", ID v ) ->
                    { eP | thickness = String.toFloat v |> Maybe.withDefault default.thickness }

                ( ID "color", ID v ) ->
                    { eP | color = JD.decodeString Colors.decoder v |> Result.withDefault default.color }

                ( ID "opacity", ID v ) ->
                    { eP | opacity = String.toFloat v |> Maybe.withDefault default.opacity }

                _ ->
                    eP
    in
    List.foldl assign default
