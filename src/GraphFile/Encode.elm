module GraphFile.Encode exposing (graphFile)

import Graph.Encode
import GraphFile as GF exposing (Bag, BagProperties, EdgeProperties, GraphFile, MyGraph, VertexProperties)
import Json.Encode as JE exposing (Value)


graphFile : GraphFile -> Value
graphFile gF =
    JE.object
        [ ( "graph", graph (GF.getGraph gF) )
        , ( "bags", bags (GF.getBags gF) )
        , ( "defaultVertexProperties"
          , vertexProperties (GF.getDefaultVertexProperties gF)
          )
        , ( "defaultEdgeProperties"
          , edgeProperties (GF.getDefaultEdgeProperties gF)
          )
        ]


graph : MyGraph -> Value
graph =
    Graph.Encode.graph
        vertexProperties
        edgeProperties


bags : List Bag -> Value
bags =
    JE.list bag


bag : Bag -> Value
bag b =
    JE.object
        [ ( "bagId", JE.int b.bagId )
        , ( "bagProperties", bagProperties b.bagProperties )
        ]


bagProperties : BagProperties -> Value
bagProperties bP =
    JE.object
        [ --label : Maybe String
          --, color : Color
          --,
          ( "hasConvexHull", JE.bool bP.hasConvexHull )
        ]


vertexProperties : VertexProperties -> Value
vertexProperties vP =
    JE.object
        [ --( "label", Maybe String )
          --,
          ( "labelIsVisible", JE.bool vP.labelIsVisible )

        --, ( "position", Point2d )
        --, ( "velocity", Vector2d )
        , ( "manyBodyStrength", JE.float vP.manyBodyStrength )

        --, ( "gravityCenter", Point2d )
        , ( "gravityStrength", JE.float vP.gravityStrength )
        , ( "fixed", JE.bool vP.fixed )

        --, ( "color", Color )
        , ( "radius", JE.float vP.radius )

        --, ( "inBags", Set BagId )
        ]


edgeProperties : EdgeProperties -> Value
edgeProperties eP =
    JE.object
        [ --("label" , Maybe String)
          --,
          ( "labelIsVisible", JE.bool eP.labelIsVisible )
        , ( "distance", JE.float eP.distance )
        , ( "strength", JE.float eP.strength )
        , ( "thickness", JE.float eP.thickness )

        --, ("color" , Color)
        ]
