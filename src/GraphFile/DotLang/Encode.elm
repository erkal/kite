module GraphFile.DotLang.Encode exposing (toDot)

import Colors
import DotLang exposing (Attr(..), AttrStmtType(..), Dot(..), EdgeRHS(..), EdgeType(..), ID(..), NodeId(..), Stmt(..))
import Graph exposing (Edge, Node)
import GraphFile as GF exposing (Bag, BagId, BagProperties, EdgeProperties, GraphFile, KiteGraph, LabelPosition(..), VertexProperties)
import Json.Encode as JE exposing (Value)
import Point2d exposing (Point2d)
import Set exposing (Set)
import Vector2d exposing (Vector2d)


toDot : GraphFile -> Dot
toDot gF =
    Dot Digraph Nothing (stmtList gF)


stmtList : GraphFile -> List Stmt
stmtList gF =
    defaults gF
        ++ nodeStmts (GF.getVertices gF)
        ++ edgeStmts (GF.getEdges gF)
        ++ bagStmts (GF.getBags gF)



--


defaults : GraphFile -> List Stmt
defaults gF =
    [ AttrStmt AttrNode (nodeAttrs (GF.getDefaultVertexProperties gF))
    , AttrStmt AttrEdge (edgeAttrs (GF.getDefaultEdgeProperties gF))
    ]



--


nodeAttrs : VertexProperties -> List Attr
nodeAttrs vP =
    [ Attr (ID "label") (ID (encodeLabel vP.label))
    , Attr (ID "labelSize") (NumeralID vP.labelSize)
    , Attr (ID "labelPosition") (ID (labelPosition vP.labelPosition))
    , Attr (ID "labelColor") (ID (Colors.toHexRGBA vP.labelColor))
    , Attr (ID "labelIsVisible") (ID (JE.encode 0 (JE.bool vP.labelIsVisible)))
    , Attr (ID "position") (ID (point2d vP.position))
    , Attr (ID "velocity") (ID (vector2d vP.velocity))
    , Attr (ID "manyBodyStrength") (NumeralID vP.manyBodyStrength)
    , Attr (ID "gravityCenter") (ID (point2d vP.gravityCenter))
    , Attr (ID "gravityStrengthX") (NumeralID vP.gravityStrengthX)
    , Attr (ID "gravityStrengthY") (NumeralID vP.gravityStrengthY)
    , Attr (ID "fixed") (ID (JE.encode 0 (JE.bool vP.fixed)))
    , Attr (ID "color") (ID (Colors.toHexRGBA vP.color))
    , Attr (ID "radius") (NumeralID vP.radius)
    , Attr (ID "borderColor") (ID (Colors.toHexRGBA vP.color))
    , Attr (ID "borderWidth") (NumeralID vP.borderWidth)
    , Attr (ID "opacity") (NumeralID vP.opacity)
    , Attr (ID "inBags") (ID (encodeInBags vP.inBags))
    ]


encodeLabel : String -> String
encodeLabel str =
    -- Such encoding is necessary, because DotLang.fromString does not work with the empty String here.
    if str == "" then
        "____NO_LABEL____"

    else
        str


encodeInBags : Set BagId -> String
encodeInBags setOfBagIds =
    if Set.isEmpty setOfBagIds then
        -- Such encoding is necessary, because DotLang.fromString does not work with the empty String here.
        "____IN_NO_BAG____"

    else
        setOfBagIds
            |> Set.toList
            |> List.map String.fromInt
            |> List.intersperse " "
            |> String.concat


labelPosition : LabelPosition -> String
labelPosition lP =
    case lP of
        LabelTopLeft ->
            "LabelTopLeft"

        LabelTop ->
            "LabelTop"

        LabelTopRight ->
            "LabelTopRight"

        LabelLeft ->
            "LabelLeft"

        LabelCenter ->
            "LabelCenter"

        LabelRight ->
            "LabelRight"

        LabelBottomLeft ->
            "LabelBottomLeft"

        LabelBottom ->
            "LabelBottom"

        LabelBottomRight ->
            "LabelBottomRight"


point2d : Point2d -> String
point2d p =
    String.concat
        [ String.fromFloat (Point2d.xCoordinate p)
        , " "
        , String.fromFloat (Point2d.yCoordinate p)
        ]


vector2d : Vector2d -> String
vector2d v =
    String.concat
        [ String.fromFloat (Vector2d.xComponent v)
        , " "
        , String.fromFloat (Vector2d.yComponent v)
        ]


edgeAttrs : EdgeProperties -> List Attr
edgeAttrs eP =
    [ Attr (ID "label") (ID (encodeLabel eP.label))
    , Attr (ID "labelSize") (NumeralID eP.labelSize)
    , Attr (ID "labelColor") (ID (Colors.toHexRGBA eP.labelColor))
    , Attr (ID "labelIsVisible") (ID (JE.encode 0 (JE.bool eP.labelIsVisible)))
    , Attr (ID "distance") (NumeralID eP.distance)
    , Attr (ID "strength") (NumeralID eP.strength)
    , Attr (ID "thickness") (NumeralID eP.thickness)
    , Attr (ID "color") (ID (Colors.toHexRGBA eP.color))
    , Attr (ID "opacity") (NumeralID eP.opacity)
    ]



--


nodeStmts : List (Node VertexProperties) -> List Stmt
nodeStmts =
    List.map nodeStmt


edgeStmts : List (Edge EdgeProperties) -> List Stmt
edgeStmts =
    List.map edgeStmt



--


nodeStmt : Node VertexProperties -> Stmt
nodeStmt { id, label } =
    NodeStmt
        (NodeId (ID (String.fromInt id)) Nothing)
        (nodeAttrs label)


edgeStmt : Edge EdgeProperties -> Stmt
edgeStmt { from, to, label } =
    EdgeStmtNode
        (NodeId (ID (String.fromInt from)) Nothing)
        (EdgeNode (NodeId (ID (String.fromInt to)) Nothing))
        []
        (edgeAttrs label)



--


bagStmts : List Bag -> List Stmt
bagStmts =
    List.map bagStmt


bagStmt : Bag -> Stmt
bagStmt bag =
    AttrStmt AttrGraph
        [ Attr (ID "bagId") (ID (String.fromInt bag.bagId))
        , Attr (ID "label") (ID bag.bagProperties.label)
        , Attr (ID "color") (ID (Colors.toHexRGBA bag.bagProperties.color))
        , Attr (ID "hasConvexHull") (ID (JE.encode 0 (JE.bool bag.bagProperties.hasConvexHull)))
        ]
