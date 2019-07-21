module GraphFile.DotLang.Decode exposing (fromDot)

import Colors
import Dict
import DotLang exposing (Attr(..), AttrStmtType(..), Dot(..), EdgeRHS(..), ID(..), NodeId(..), Stmt(..))
import Graph exposing (Node)
import GraphFile as GF exposing (Bag, BagDict, BagId, BagProperties, EdgeProperties, GraphFile, KiteGraph, LabelPosition(..), VertexProperties)
import Json.Decode as JD exposing (Error)
import Parser exposing ((|.), (|=), Parser, Trailing(..))
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

                AttrStmt AttrGraph attrList ->
                    { p
                        | bags =
                            insertBagWithId GF.kitesDefaultBagProperties attrList p.bags
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


insertBagWithId : BagProperties -> List Attr -> BagDict -> BagDict
insertBagWithId default attrList =
    let
        bagId =
            attrList
                |> List.filterMap
                    (\attr ->
                        case attr of
                            Attr (ID "bagId") (ID v) ->
                                String.toInt v

                            _ ->
                                Nothing
                    )
                |> List.head
                |> Maybe.withDefault 666

        assign (Attr key value) bP =
            case ( key, value ) of
                ( ID "label", ID v ) ->
                    { bP | label = v }

                ( ID "hasConvexHull", ID v ) ->
                    { bP | hasConvexHull = JD.decodeString JD.bool v |> Result.withDefault False }

                ( ID "color", ID v ) ->
                    { bP | color = Colors.fromHexRGBA v }

                _ ->
                    bP
    in
    Dict.insert bagId (List.foldl assign default attrList)


vertexProperties : VertexProperties -> List Attr -> VertexProperties
vertexProperties default =
    let
        assign (Attr key value) vP =
            case ( key, value ) of
                ( ID "label", ID v ) ->
                    { vP | label = v }

                ( ID "labelSize", NumeralID v ) ->
                    { vP | labelSize = v }

                ( ID "labelPosition", ID v ) ->
                    { vP | labelPosition = labelPosition v }

                ( ID "labelColor", ID v ) ->
                    { vP | labelColor = Colors.fromHexRGBA v }

                ( ID "labelIsVisible", ID v ) ->
                    { vP
                        | labelIsVisible =
                            JD.decodeString JD.bool v |> Result.withDefault default.labelIsVisible
                    }

                ( ID "position", ID v ) ->
                    { vP
                        | position =
                            Parser.run floatPair v
                                |> Result.map Point2d.fromCoordinates
                                |> Result.withDefault default.position
                    }

                ( ID "velocity", ID v ) ->
                    { vP
                        | velocity =
                            Parser.run floatPair v
                                |> Result.map Vector2d.fromComponents
                                |> Result.withDefault default.velocity
                    }

                ( ID "manyBodyStrength", NumeralID v ) ->
                    { vP | manyBodyStrength = v }

                ( ID "gravityCenter", ID v ) ->
                    { vP
                        | gravityCenter =
                            Parser.run floatPair v
                                |> Result.map Point2d.fromCoordinates
                                |> Result.withDefault default.gravityCenter
                    }

                ( ID "gravityStrengthX", NumeralID v ) ->
                    { vP | gravityStrengthX = v }

                ( ID "gravityStrengthY", NumeralID v ) ->
                    { vP | gravityStrengthY = v }

                ( ID "fixed", ID v ) ->
                    { vP
                        | fixed =
                            JD.decodeString JD.bool v
                                |> Result.withDefault default.fixed
                    }

                ( ID "color", ID v ) ->
                    { vP | color = Colors.fromHexRGBA v }

                ( ID "radius", NumeralID v ) ->
                    { vP | radius = v }

                ( ID "borderColor", ID v ) ->
                    { vP | borderColor = Colors.fromHexRGBA v }

                ( ID "borderWidth", NumeralID v ) ->
                    { vP | borderWidth = v }

                ( ID "opacity", NumeralID v ) ->
                    { vP | opacity = v }

                ( ID "inBags", ID v ) ->
                    { vP
                        | inBags =
                            v
                                |> JD.decodeString (JD.map Set.fromList (JD.list JD.int))
                                |> Result.withDefault default.inBags
                    }

                _ ->
                    vP
    in
    List.foldl assign default


floatPair : Parser ( Float, Float )
floatPair =
    Parser.succeed Tuple.pair
        |. Parser.spaces
        |= Parser.float
        |. Parser.spaces
        |= Parser.float


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

                ( ID "labelSize", NumeralID v ) ->
                    { eP | labelSize = v }

                ( ID "labelColor", ID v ) ->
                    { eP | labelColor = Colors.fromHexRGBA v }

                ( ID "labelIsVisible", ID v ) ->
                    { eP | labelIsVisible = JD.decodeString JD.bool v |> Result.withDefault default.labelIsVisible }

                ( ID "distance", NumeralID v ) ->
                    { eP | distance = v }

                ( ID "strength", NumeralID v ) ->
                    { eP | strength = v }

                ( ID "thickness", NumeralID v ) ->
                    { eP | thickness = v }

                ( ID "color", ID v ) ->
                    { eP | color = Colors.fromHexRGBA v }

                ( ID "opacity", NumeralID v ) ->
                    { eP | opacity = v }

                _ ->
                    eP
    in
    List.foldl assign default
