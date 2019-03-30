module GraphFile.DotLang.Encode exposing (toDot)

import Colors
import DotLang exposing (Attr(..), AttrStmtType(..), Dot(..), EdgeRHS(..), EdgeType(..), ID(..), NodeId(..), Stmt(..))
import Graph exposing (Edge, Node)
import GraphFile as GF exposing (Bag, BagProperties, EdgeProperties, GraphFile, KiteGraph, LabelPosition(..), VertexProperties)
import Json.Encode as JE exposing (Value)
import Point2d exposing (Point2d)
import Set
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
    [ Attr (ID "label") (ID vP.label)
    , Attr (ID "labelSize") (ID (String.fromFloat vP.labelSize))
    , Attr (ID "labelPosition") (ID (labelPosition vP.labelPosition))
    , Attr (ID "labelColor") (ID (JE.encode 0 (Colors.encode vP.labelColor)))
    , Attr (ID "labelIsVisible") (ID (JE.encode 0 (JE.bool vP.labelIsVisible)))
    , Attr (ID "position") (ID (point2d vP.position))
    , Attr (ID "velocity") (ID (vector2d vP.velocity))
    , Attr (ID "manyBodyStrength") (ID (String.fromFloat vP.manyBodyStrength))
    , Attr (ID "gravityCenter") (ID (point2d vP.gravityCenter))
    , Attr (ID "gravityStrengthX") (ID (String.fromFloat vP.gravityStrengthX))
    , Attr (ID "gravityStrengthY") (ID (String.fromFloat vP.gravityStrengthY))
    , Attr (ID "fixed") (ID (JE.encode 0 (JE.bool vP.fixed)))
    , Attr (ID "color") (ID (JE.encode 0 (Colors.encode vP.color)))
    , Attr (ID "radius") (ID (String.fromFloat vP.radius))
    , Attr (ID "borderColor") (ID (JE.encode 0 (Colors.encode vP.color)))
    , Attr (ID "borderWidth") (ID (String.fromFloat vP.borderWidth))
    , Attr (ID "opacity") (ID (String.fromFloat vP.opacity))
    , Attr (ID "inBags") (ID (JE.encode 0 (JE.list JE.int (Set.toList vP.inBags))))
    ]


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
    JE.encode 0 <|
        JE.object
            [ ( "xCoordinate", JE.float (Point2d.xCoordinate p) )
            , ( "yCoordinate", JE.float (Point2d.yCoordinate p) )
            ]


vector2d : Vector2d -> String
vector2d v =
    JE.encode 0 <|
        JE.object
            [ ( "xComponent", JE.float (Vector2d.xComponent v) )
            , ( "yComponent", JE.float (Vector2d.yComponent v) )
            ]


edgeAttrs : EdgeProperties -> List Attr
edgeAttrs eP =
    [ Attr (ID "label") (ID eP.label)
    , Attr (ID "labelSize") (ID (String.fromFloat eP.labelSize))
    , Attr (ID "labelColor") (ID (JE.encode 0 (Colors.encode eP.labelColor)))
    , Attr (ID "labelIsVisible") (ID (JE.encode 0 (JE.bool eP.labelIsVisible)))
    , Attr (ID "distance") (ID (String.fromFloat eP.distance))
    , Attr (ID "strength") (ID (String.fromFloat eP.strength))
    , Attr (ID "thickness") (ID (String.fromFloat eP.thickness))
    , Attr (ID "color") (ID (JE.encode 0 (Colors.encode eP.color)))
    , Attr (ID "opacity") (ID (String.fromFloat eP.opacity))
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
        , Attr (ID "color") (ID (JE.encode 0 (Colors.encode bag.bagProperties.color)))
        , Attr (ID "hasConvexHull") (ID (JE.encode 0 (JE.bool bag.bagProperties.hasConvexHull)))
        ]
