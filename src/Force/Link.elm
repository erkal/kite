module Force.Link exposing (Param, run)

import Point2d exposing (Point2d)
import Vector2d exposing (Vector2d)


type alias Param =
    { source : { id : Int, position : Point2d, velocity : Vector2d }
    , target : { id : Int, position : Point2d, velocity : Vector2d }
    , distance : Float
    , strength : Float
    }


run : Float -> List Param -> List { id : Int, velocity : Vector2d }
run alpha =
    let
        handle : Param -> List { id : Int, velocity : Vector2d }
        handle lP =
            let
                diff =
                    Vector2d.from
                        (lP.source.position |> Point2d.translateBy lP.source.velocity)
                        (lP.target.position |> Point2d.translateBy lP.target.velocity)

                d =
                    Vector2d.length diff

                l =
                    (d - lP.distance) / 2 * d * alpha * lP.strength

                f =
                    diff |> Vector2d.scaleBy l
            in
            [ { id = lP.source.id
              , velocity = Vector2d.difference lP.source.velocity f
              }
            , { id = lP.target.id
              , velocity = Vector2d.sum lP.target.velocity f
              }
            ]
    in
    List.concatMap handle
