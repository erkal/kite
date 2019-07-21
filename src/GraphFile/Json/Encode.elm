module GraphFile.Json.Encode exposing (encode)

import Colors
import Graph.Json.Encode
import GraphFile as GF exposing (Bag, BagProperties, EdgeProperties, GraphFile, KiteGraph, LabelPosition(..), VertexProperties)
import Json.Encode as JE exposing (Value)
import Point2d exposing (Point2d)
import Set
import Vector2d exposing (Vector2d)


encode : GraphFile -> Value
encode gF =
    JE.object
        [ ( "graph", encodeKiteGraph (GF.getGraph gF) )
        , ( "bags", encodeBags (GF.getBags gF) )
        , ( "defaultVertexProperties"
          , encodeVertexProperties (GF.getDefaultVertexProperties gF)
          )
        , ( "defaultEdgeProperties"
          , encodeEdgeProperties (GF.getDefaultEdgeProperties gF)
          )
        ]


encodeKiteGraph : KiteGraph -> Value
encodeKiteGraph =
    Graph.Json.Encode.encode
        encodeVertexProperties
        encodeEdgeProperties


encodeBags : List Bag -> Value
encodeBags =
    JE.list encodeBag


encodeBag : Bag -> Value
encodeBag b =
    JE.object
        [ ( "bagId", JE.int b.bagId )
        , ( "bagProperties", encodeBagProperties b.bagProperties )
        ]


encodeBagProperties : BagProperties -> Value
encodeBagProperties bP =
    JE.object
        [ ( "label", JE.string bP.label )
        , ( "color", Colors.encode bP.color )
        , ( "hasConvexHull", JE.bool bP.hasConvexHull )
        ]


encodeVertexProperties : VertexProperties -> Value
encodeVertexProperties vP =
    JE.object
        [ ( "label", JE.string vP.label )
        , ( "labelSize", JE.float vP.labelSize )
        , ( "labelPosition", encodeLabelPosition vP.labelPosition )
        , ( "labelColor", Colors.encode vP.labelColor )
        , ( "labelIsVisible", JE.bool vP.labelIsVisible )
        , ( "position", encodePoint2d vP.position )
        , ( "velocity", encodeVector2d vP.velocity )
        , ( "manyBodyStrength", JE.float vP.manyBodyStrength )
        , ( "gravityCenter", encodePoint2d vP.gravityCenter )
        , ( "gravityStrengthX", JE.float vP.gravityStrengthX )
        , ( "gravityStrengthY", JE.float vP.gravityStrengthY )
        , ( "fixed", JE.bool vP.fixed )
        , ( "color", Colors.encode vP.color )
        , ( "radius", JE.float vP.radius )
        , ( "borderColor", Colors.encode vP.color )
        , ( "borderWidth", JE.float vP.borderWidth )
        , ( "opacity", JE.float vP.opacity )
        , ( "inBags", JE.list JE.int (Set.toList vP.inBags) )
        ]


encodeLabelPosition : LabelPosition -> Value
encodeLabelPosition lP =
    JE.string <|
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


encodeEdgeProperties : EdgeProperties -> Value
encodeEdgeProperties eP =
    JE.object
        [ ( "label", JE.string eP.label )
        , ( "labelSize", JE.float eP.labelSize )
        , ( "labelColor", Colors.encode eP.labelColor )
        , ( "labelIsVisible", JE.bool eP.labelIsVisible )
        , ( "distance", JE.float eP.distance )
        , ( "strength", JE.float eP.strength )
        , ( "thickness", JE.float eP.thickness )
        , ( "color", Colors.encode eP.color )
        , ( "opacity", JE.float eP.opacity )
        ]


encodePoint2d : Point2d -> Value
encodePoint2d p =
    JE.object
        [ ( "xCoordinate", JE.float (Point2d.xCoordinate p) )
        , ( "yCoordinate", JE.float (Point2d.yCoordinate p) )
        ]


encodeVector2d : Vector2d -> Value
encodeVector2d v =
    JE.object
        [ ( "xComponent", JE.float (Vector2d.xComponent v) )
        , ( "yComponent", JE.float (Vector2d.yComponent v) )
        ]
