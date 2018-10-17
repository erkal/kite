module Force exposing (Force(..), ForceEdge, ForceGraph, ForceVertex, State(..), applyForce, isCompleted, reheat, simulation, tick)

import Dict exposing (Dict)
import Force.ManyBody as ManyBody
import Graph exposing (Edge, Graph, Node, NodeId)
import Graph.Extra
import Point2d exposing (Point2d)
import Vector2d exposing (Vector2d)


type State
    = State
        { forces : List Force
        , alpha : Float
        , minAlpha : Float
        , alphaDecay : Float
        , alphaTarget : Float
        , velocityDecay : Float
        }


type Force
    = Links
    | ManyBody Float


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


{-| This ONLY UPDATES THE VERTEX VELOCITIES but does not touch the positions.
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
            --     |> Dict.update target (Maybe.map (\sn -> { sn | vx = sn.vx - x * l,
            --                                                     vy = sn.vy - y * l }))
            --     |> Dict.update source (Maybe.map (\tn -> { tn | vx = tn.vx + x * l,
            --                                                     vy = tn.vy + y * l }))
            let
                up : Edge (ForceEdge e) -> ForceGraph n e -> ForceGraph n e
                up { from, to, label } fG =
                    let
                        getPosition : NodeId -> Maybe Point2d
                        getPosition id =
                            forceGraph |> Graph.get id |> Maybe.map (.node >> .label >> .position)

                        updateVelocity : NodeId -> (Vector2d -> Vector2d) -> ForceGraph n e -> ForceGraph n e
                        updateVelocity id velocityUpdater =
                            -- TODO: Make this more beautiful
                            Graph.Extra.updateNodeBy id velocityUpdater (\velocityUpdater_ vP -> { vP | velocity = velocityUpdater_ vP.velocity })
                    in
                    case ( getPosition from, getPosition to ) of
                        ( Just sourcePosition, Just targetPosition ) ->
                            let
                                diff =
                                    -- TODO: This is different than the original. If this this doesn't work properly, do it like in the original with the new vertex positions.
                                    Vector2d.from sourcePosition targetPosition

                                d =
                                    Vector2d.length diff

                                l =
                                    (d - label.distance) / d * alpha * label.strength
                            in
                            fG
                                |> updateVelocity from (Vector2d.sum (Vector2d.scaleBy -l diff))
                                |> updateVelocity to (Vector2d.sum (Vector2d.scaleBy l diff))

                        _ ->
                            fG
            in
            Graph.edges forceGraph |> List.foldr up forceGraph

        -- forceGraph
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


reheat : State -> State
reheat (State config) =
    State { config | alpha = 1.0 }


isCompleted : State -> Bool
isCompleted (State { alpha, minAlpha }) =
    alpha <= minAlpha



{- You can set this to control how quickly the simulation should converge. The default value is 300 iterations.

   Lower number of iterations will produce a layout quicker, but risk getting stuck in a local minimum. Higher values take
   longer, but typically produce better results.

-}
-- iterations : Int -> State -> State
-- iterations iters (State config) =
--     State { config | alphaDecay = 1 - config.minAlpha ^ (1 / toFloat iters) }
