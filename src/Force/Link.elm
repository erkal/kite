module Force.Link exposing (Param, run)

import Point2d exposing (Point2d)
import Vector2d exposing (Vector2d)


type alias Param =
    { source : { id : Int, degree : Int, position : Point2d, velocity : Vector2d }
    , target : { id : Int, degree : Int, position : Point2d, velocity : Vector2d }
    , distance : Float
    , strength : Float
    }


run : Float -> List Param -> List { id : Int, velocity : Vector2d }
run alpha =
    let
        handle : Param -> List { id : Int, velocity : Vector2d }
        handle { source, target, distance, strength } =
            let
                diff =
                    Vector2d.from
                        (source.position |> Point2d.translateBy source.velocity)
                        (target.position |> Point2d.translateBy target.velocity)

                d =
                    Vector2d.length diff

                l =
                    alpha * strength * (d - distance) / d

                f =
                    diff |> Vector2d.scaleBy l

                bias =
                    toFloat source.degree / toFloat (source.degree + target.degree)
            in
            [ { id = source.id
              , velocity = Vector2d.sum source.velocity (Vector2d.scaleBy (1 - bias) f)
              }
            , { id = target.id
              , velocity = Vector2d.difference target.velocity (Vector2d.scaleBy bias f)
              }
            ]
    in
    List.concatMap handle
