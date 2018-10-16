module Force exposing (Force(..), ForceEdge, ForceGraph, ForceVertex, State(..), applyForce, isCompleted, iterations, reheat, simulation, tick)

import Dict exposing (Dict)
import Force.ManyBody as ManyBody
import Graph exposing (Graph, Node, NodeId)
import Graph.Extra
import Point2d exposing (Point2d)
import Vector2d exposing (Vector2d)


type alias ForceVertex n =
    { n
        | position : Point2d
        , velocity : Vector2d
        , strength : Float
        , fixed : Bool
    }


type alias ForceEdge e =
    { e
        | distance : Float
        , strength : Float
    }


type alias ForceGraph n e =
    Graph (ForceVertex n) (ForceEdge e)


type Force
    = -- Links Int (List (LinkParam comparable))
      -- |
      ManyBody Float


{-| This only updates the vertex velocities but does not touch the positions.
-}
applyForce : Float -> Force -> ForceGraph n e -> ForceGraph n e
applyForce alpha force forceGraph =
    case force of
        -- Links iters lnks ->
        --     List.foldl
        --         (\{ source, target, distance, strength, bias } ents ->
        --             case ( Dict.get source ents, Dict.get target ents ) of
        --                 ( Just sourceNode, Just targetNode ) ->
        --                     let
        --                         x =
        --                             targetNode.x + targetNode.vx - sourceNode.x - sourceNode.vx
        --                         y =
        --                             targetNode.y + targetNode.vy - sourceNode.y - sourceNode.vy
        --                         d =
        --                             sqrt (x ^ 2 + y ^ 2)
        --                         l =
        --                             (d - distance) / d * alpha * strength
        --                     in
        --                     ents
        --                         |> Dict.update target (Maybe.map (\sn -> { sn | vx = sn.vx - x * l * bias, vy = sn.vy - y * l * bias }))
        --                         |> Dict.update source (Maybe.map (\tn -> { tn | vx = tn.vx + x * l * (1 - bias), vy = tn.vy + y * l * (1 - bias) }))
        --                 otherwise ->
        --                     ents
        --         )
        --         entities
        --         lnks
        ManyBody theta ->
            let
                toManyBodyVertex : Node (ForceVertex n) -> ManyBody.Vertex NodeId
                toManyBodyVertex { id, label } =
                    { key = id
                    , position = label.position
                    , velocity = label.velocity
                    , strength = label.strength
                    }

                manyBodyVerticesWithNewVelocities =
                    forceGraph
                        |> Graph.nodes
                        |> List.map toManyBodyVertex
                        |> ManyBody.manyBody alpha theta
                        |> List.map (\({ key } as mBV) -> ( key, mBV ))

                updateVelocity { velocity } forceVertex =
                    { forceVertex | velocity = velocity }
            in
            forceGraph
                |> Graph.Extra.updateNodesBy manyBodyVerticesWithNewVelocities updateVelocity


tick : State -> ForceGraph n e -> ( State, ForceGraph n e )
tick (State state) forceGraph =
    let
        newAlpha =
            state.alpha + (state.alphaTarget - state.alpha) * state.alphaDecay

        applyVelocity forceVertex =
            let
                sV =
                    forceVertex.velocity |> Vector2d.scaleBy state.velocityDecay
            in
            if forceVertex.fixed then
                forceVertex

            else
                { forceVertex
                    | position = forceVertex.position |> Point2d.translateBy sV
                    , velocity = sV
                }
    in
    ( State { state | alpha = newAlpha }
    , state.forces |> List.foldl (applyForce newAlpha) forceGraph |> Graph.mapNodes applyVelocity
    )


simulation : List Force -> State
simulation forces =
    State
        { forces = forces
        , alpha = 1.0
        , minAlpha = 0.001
        , alphaDecay = 1 - 0.001 ^ (1 / 300)
        , alphaTarget = 0.0
        , velocityDecay = 0.6
        }


{-| You can set this to control how quickly the simulation should converge. The default value is 300 iterations.

Lower number of iterations will produce a layout quicker, but risk getting stuck in a local minimum. Higher values take
longer, but typically produce better results.

-}
iterations : Int -> State -> State
iterations iters (State config) =
    State { config | alphaDecay = 1 - config.minAlpha ^ (1 / toFloat iters) }


reheat : State -> State
reheat (State config) =
    State { config | alpha = 1.0 }


isCompleted : State -> Bool
isCompleted (State { alpha, minAlpha }) =
    alpha <= minAlpha


type State
    = State
        { forces : List Force
        , alpha : Float
        , minAlpha : Float
        , alphaDecay : Float
        , alphaTarget : Float
        , velocityDecay : Float
        }



-- type alias LinkParam comparable =
--     { source : comparable
--     , target : comparable
--     , distance : Float
--     , strength : Float
--     , bias : Float
--     }
-- customLinks : Int -> List { source : comparable, target : comparable, distance : Float, strength : Maybe Float } -> Force
-- customLinks iters list =
--     let
--         counts =
--             List.foldr
--                 (\{ source, target } d ->
--                     d
--                         |> Dict.update source
--                             (Just << Maybe.withDefault 1 << Maybe.map ((+) 1))
--                         |> Dict.update target
--                             (Just << Maybe.withDefault 1 << Maybe.map ((+) 1))
--                 )
--                 Dict.empty
--                 list
--         count key =
--             Dict.get key counts |> Maybe.withDefault 0
--     in
--     list
--         |> List.map
--             (\{ source, target, distance, strength } ->
--                 { source = source
--                 , target = target
--                 , distance = distance
--                 , strength = Maybe.withDefault (1 / min (count source) (count target)) strength
--                 , bias = count source / (count source + count target)
--                 }
--             )
--         |> Links iters
