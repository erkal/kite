module Graph.Force.Gravity exposing (Vertex, run)

import Point2d exposing (Point2d)
import Vector2d exposing (Vector2d)


type alias Vertex =
    { id : Int
    , position : Point2d
    , velocity : Vector2d
    , gravityCenter : Point2d
    , gravityStrengthX : Float
    , gravityStrengthY : Float
    }


run : Float -> List Vertex -> List ( Int, Vector2d )
run alpha =
    let
        handle : Vertex -> ( Int, Vector2d )
        handle { id, position, velocity, gravityCenter, gravityStrengthX, gravityStrengthY } =
            let
                v =
                    Vector2d.from position gravityCenter

                velocityDelta =
                    Vector2d.fromComponents
                        ( Vector2d.xComponent v * gravityStrengthX * alpha
                        , Vector2d.yComponent v * gravityStrengthY * alpha
                        )
            in
            ( id
            , Vector2d.sum velocity velocityDelta
            )
    in
    List.map handle
