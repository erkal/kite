module Graph.Force exposing
    ( Force(..)
    , ForceGraph
    , State
    , alphaTarget
    , defaultForceState
    , isCompleted
    , tick
    )

import Graph exposing (Edge, Graph, Node, NodeId)
import Graph.Extra
import Graph.Force.Gravity as Gravity
import Graph.Force.Link as Link
import Graph.Force.ManyBody as ManyBody
import Point2d exposing (Point2d)
import Vector2d exposing (Vector2d)


type State
    = State
        { alpha : Float
        , minAlpha : Float
        , alphaDecay : Float
        , alphaTarget : Float
        , velocityDecay : Float
        }


type Force
    = Link
    | ManyBody Float
    | Gravity


type alias ForceVertex n =
    { n
        | position : Point2d
        , velocity : Velocity
        , manyBodyStrength : Float
        , gravityCenter : Point2d
        , gravityStrengthX : Float
        , gravityStrengthY : Float
        , fixed : Bool
    }


type alias Velocity =
    Vector2d


type alias ForceEdge e =
    { e
        | distance : Float
        , strength : Float
    }


type alias ForceGraph n e =
    Graph (ForceVertex n) (ForceEdge e)


defaultForceState : State
defaultForceState =
    State
        { alpha = 1.0
        , minAlpha = 0.001
        , alphaDecay = 1 - 0.001 ^ (1 / 300)
        , alphaTarget = 0.0
        , velocityDecay = 0.6
        }


updateVelocities : List ( NodeId, Velocity ) -> ForceGraph n e -> ForceGraph n e
updateVelocities newVelocities =
    let
        applyVelocity : Velocity -> ForceVertex n -> ForceVertex n
        applyVelocity velocity forceVertex =
            { forceVertex | velocity = velocity }
    in
    Graph.Extra.updateNodesBy newVelocities applyVelocity


{-| This ONLY UPDATES THE VERTEX VELOCITIES but does not touch the positions.
-}
applyForce : Float -> Force -> ForceGraph n e -> ForceGraph n e
applyForce alpha force forceGraph =
    case force of
        Link ->
            let
                getData id =
                    case forceGraph |> Graph.get id of
                        Just ctx ->
                            { id = id
                            , degree = forceGraph |> Graph.Extra.degree id
                            , position = ctx.node.label.position
                            , velocity = ctx.node.label.velocity
                            }

                        _ ->
                            --Debug.todo "This shouldn't happen!" <|
                            { id = 0
                            , degree = 0
                            , position = Point2d.origin
                            , velocity = Vector2d.zero
                            }

                toLinkParam : Edge (ForceEdge e) -> Link.Param
                toLinkParam { from, to, label } =
                    { source = getData from
                    , target = getData to
                    , distance = label.distance
                    , strength = label.strength
                    }

                newVelocities : List ( NodeId, Velocity )
                newVelocities =
                    forceGraph
                        |> Graph.edges
                        |> List.map toLinkParam
                        |> Link.run alpha
            in
            forceGraph |> updateVelocities newVelocities

        ManyBody theta ->
            let
                toManyBodyVertex : Node (ForceVertex n) -> ManyBody.Vertex NodeId
                toManyBodyVertex { id, label } =
                    { key = id
                    , position = label.position
                    , velocity = label.velocity
                    , strength = label.manyBodyStrength
                    }

                newVelocities : List ( NodeId, Velocity )
                newVelocities =
                    forceGraph
                        |> Graph.nodes
                        |> List.map toManyBodyVertex
                        |> ManyBody.run alpha theta
                        |> List.map (\{ key, velocity } -> ( key, velocity ))
            in
            forceGraph |> updateVelocities newVelocities

        Gravity ->
            let
                toGravityVertex : Node (ForceVertex n) -> Gravity.Vertex
                toGravityVertex { id, label } =
                    { id = id
                    , position = label.position
                    , velocity = label.velocity
                    , gravityCenter = label.gravityCenter
                    , gravityStrengthX = label.gravityStrengthX
                    , gravityStrengthY = label.gravityStrengthY
                    }

                newVelocities : List ( NodeId, Velocity )
                newVelocities =
                    forceGraph
                        |> Graph.nodes
                        |> List.map toGravityVertex
                        |> Gravity.run alpha
            in
            forceGraph |> updateVelocities newVelocities


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
                { forceVertex
                    | velocity = Vector2d.zero
                }

            else
                { forceVertex
                    | position = forceVertex.position |> Point2d.translateBy sV
                    , velocity = sV
                }
    in
    ( State { state | alpha = newAlpha }
    , [ Link, ManyBody 0.9, Gravity ]
        |> List.foldl (applyForce newAlpha) forceGraph
        |> Graph.mapNodes applyVelocity
    )


alphaTarget : Float -> State -> State
alphaTarget aT (State config) =
    State { config | alphaTarget = aT }


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
