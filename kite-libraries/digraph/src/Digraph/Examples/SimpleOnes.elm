module Digraph.Examples.SimpleOnes exposing (..)

import Dict exposing (Dict)
import Digraph exposing (..)
import Digraph.Generators.Basic exposing (fromAbstractDigraph)


fruchtGraph : Digraph.Model
fruchtGraph =
    fromAbstractDigraph
        { vertexList = [ "a1", "a2", "a3", "b1", "b2", "b3", "c1", "c2", "c3", "d", "e", "f" ]
        , edgeList =
            [ ( "a1", "a2" )
            , ( "a2", "a3" )
            , ( "a3", "a1" )
            , ( "b1", "b2" )
            , ( "b2", "b3" )
            , ( "b3", "b1" )
            , ( "c1", "c2" )
            , ( "c2", "c3" )
            , ( "c3", "c1" )
            , ( "f", "a2" )
            , ( "f", "b3" )
            , ( "f", "d" )
            , ( "d", "a1" )
            , ( "d", "e" )
            , ( "e", "b1" )
            , ( "e", "c1" )
            , ( "a3", "c2" )
            , ( "c3", "b2" )
            ]
        }


sEP : EdgeProp
sEP =
    Digraph.standardEdgeProp


sVP : VertexProp
sVP =
    Digraph.standardVertexProp


sNFD : Digraph.NodeForceData
sNFD =
    Digraph.standardNodeForceData


kiteWithFixedNode : Digraph.Model
kiteWithFixedNode =
    Digraph.digraph
        { vertices =
            Dict.fromList
                [ ( "0", { sVP | position = ( 650, 226 ), force = { sNFD | fixed = True }, color = "purple" } )
                , ( "1", { sVP | position = ( 383, 261 ) } )
                , ( "2", { sVP | position = ( 431, 275 ) } )
                , ( "3", { sVP | position = ( 395, 311 ) } )
                , ( "4", { sVP | position = ( 381, 364 ), radius = 20 } )
                ]
        , edges =
            Dict.fromList
                [ ( ( "0", "1" ), sEP )
                , ( ( "2", "0" ), sEP )
                , ( ( "1", "2" ), sEP )
                , ( ( "1", "3" ), sEP )
                , ( ( "2", "3" ), sEP )
                , ( ( "3", "4" ), sEP )
                ]
        , scaleAndTranslate = { scale = 1, translate = ( 0, 0 ) }
        }
