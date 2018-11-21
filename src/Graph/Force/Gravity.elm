module Graph.Force.Gravity exposing (Vertex, run)

import IntDict exposing (IntDict)
import Point2d exposing (Point2d)
import Vector2d exposing (Vector2d)


type alias Vertex =
    { id : Int
    , position : Point2d
    , velocity : Vector2d
    , gravityCenter : Point2d
    , gravityStrength : Float
    }


run : Float -> List Vertex -> List ( Int, Vector2d )
run alpha =
    let
        handle : Vertex -> ( Int, Vector2d )
        handle { id, position, velocity, gravityCenter, gravityStrength } =
            let
                k =
                    gravityStrength * alpha

                velocityDelta =
                    Vector2d.from position gravityCenter
                        |> Vector2d.scaleBy k
            in
            ( id
            , Vector2d.sum velocity velocityDelta
            )
    in
    List.map handle
