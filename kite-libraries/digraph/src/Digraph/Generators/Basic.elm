module Digraph.Generators.Basic exposing (..)

import Dict exposing (Dict)
import AbstractDigraph exposing (AbstractDigraph)
import Digraph
import PanAndZoom.Basics as PB
import BasicGeometry


toAbstractDigraph : Digraph.Model -> AbstractDigraph String
toAbstractDigraph digraph =
    { vertexList = digraph.vertices |> Dict.keys
    , edgeList = digraph.edges |> Dict.keys
    }


fromAbstractDigraph : AbstractDigraph comparable -> Digraph.Model
fromAbstractDigraph abstractDigraph =
    fromAbstractDigraphWithCenter
        { center = ( 600, 350 )
        , abstractDigraph = abstractDigraph |> AbstractDigraph.turnVerticesIntoString
        }


fromAbstractDigraphWithCenter : { center : ( Float, Float ), abstractDigraph : AbstractDigraph comparable } -> Digraph.Model
fromAbstractDigraphWithCenter { center, abstractDigraph } =
    let
        vP =
            Digraph.standardVertexProp

        vPList =
            List.range 0 (List.length abstractDigraph.vertexList - 1)
                |> List.map (\i -> vP)
                |> BasicGeometry.applyCircularCoords { maxObjectRadius = vP.radius, center = center }
    in
        { vertices =
            List.map2 (,) abstractDigraph.vertexList vPList
                |> Dict.fromList
        , edges =
            abstractDigraph.edgeList
                |> List.map (\e -> ( e, Digraph.standardEdgeProp ))
                |> Dict.fromList
        , scaleAndTranslate = PB.default
        }
