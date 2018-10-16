module Force exposing (Force(..), ForceEdge, ForceGraph, ForceVertex, State(..), applyForce, isCompleted, iterations, reheat, simulation, tick)

import Dict exposing (Dict)
import Force.ManyBody as ManyBody
import Graph exposing (Edge, Graph, Node, NodeId)
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
    = Links
    | ManyBody Float


{-| This only updates the vertex velocities but does not touch the positions.
-}
applyForce : Float -> Force -> ForceGraph n e -> ForceGraph n e
applyForce alpha force forceGraph =
    case force of
        Links ->
            -- let
            --     x =
            --         targetNode.x + targetNode.vx - sourceNode.x - sourceNode.vx
            --     y =
            --         targetNode.y + targetNode.vy - sourceNode.y - sourceNode.vy
            --     d =
            --         sqrt (x ^ 2 + y ^ 2)
            --     l =
            --         (d - distance) / d * alpha * strength
            -- in
            -- ents
            --     |> Dict.update target (Maybe.map (\sn -> { sn | vx = sn.vx - x * l * 0.5,
            --                                                     vy = sn.vy - y * l * 0.5 }))
            --     |> Dict.update source (Maybe.map (\tn -> { tn | vx = tn.vx + x * l * 0.5,
            --                                                     vy = tn.vy + y * l * 0.5 }))
            let
                up : Edge e -> ForceGraph n e -> ForceGraph n e
                up { from, to, label } fG =
                    fG
            in
            -- Graph.edges forceGraph |> List.foldr up forceGraph
            forceGraph

        ManyBody theta ->
            let
                toManyBodyVertex : Node (ForceVertex n) -> ManyBody.Vertex NodeId
                toManyBodyVertex { id, label } =
                    { key = id
                    , position = label.position
                    , velocity = label.velocity
                    , strength = label.strength
                    }

                manyBodyVerticesWithNewVelocities : List ( NodeId, ManyBody.Vertex NodeId )
                manyBodyVerticesWithNewVelocities =
                    forceGraph
                        |> Graph.nodes
                        |> List.map toManyBodyVertex
                        |> ManyBody.manyBody alpha theta
                        |> List.map (\({ key } as mBV) -> ( key, mBV ))

                updateVelocity : ManyBody.Vertex NodeId -> ForceVertex n -> ForceVertex n
                updateVelocity { velocity } forceVertex =
                    { forceVertex | velocity = velocity }
            in
            forceGraph |> Graph.Extra.updateNodesBy manyBodyVerticesWithNewVelocities updateVelocity


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
