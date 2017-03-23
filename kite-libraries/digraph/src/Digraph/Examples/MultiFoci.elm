module Digraph.Examples.MultiFoci exposing (..)

import Dict
import Digraph
import Digraph.Generators.Basic exposing (fromAbstractDigraph)


multifoci : Digraph.Model
multifoci =
    let
        forceOfPulled id =
            let
                ( gC, color, radius, hullId ) =
                    if id % 4 == 0 then
                        ( ( 500, 250 ), "#ff9300", 5, Just "first-Hull" )
                    else if id % 4 == 1 then
                        ( ( 500, 450 ), "#f03e31", 5, Just "second-Hull" )
                    else if id % 4 == 2 then
                        ( ( 700, 450 ), "#d783ff", 5, Just "third-hull" )
                    else
                        ( ( 700, 250 ), "#9437ff", 5, Just "fourth-hull" )
            in
                let
                    sNFD =
                        Digraph.standardNodeForceData
                in
                    ( { sNFD
                        | gC = Just gC
                        , pullStrengthTogC = 0.2
                      }
                    , color
                    , radius
                    , hullId
                    )
    in
        { vertexList = List.range 0 59
        , edgeList = [ ( 0, 1 ) ]
        }
            |> fromAbstractDigraph
            |> (\g ->
                    { g
                        | vertices =
                            g.vertices
                                |> Dict.map
                                    (\id vP ->
                                        let
                                            ( newForce, newColor, newRadius, newHullId ) =
                                                case String.toInt id of
                                                    Ok intId ->
                                                        forceOfPulled intId

                                                    Err _ ->
                                                        Debug.crash ""
                                        in
                                            { vP
                                                | force = newForce
                                                , color = newColor
                                                , radius = newRadius
                                                , hullId = newHullId
                                            }
                                    )
                        , edges =
                            g.edges
                                |> Dict.map
                                    (\_ eP ->
                                        let
                                            oldForce =
                                                eP.force
                                        in
                                            { eP | force = { oldForce | distance = 10 } }
                                    )
                    }
               )
