module Widgets.RandomGraph exposing (..)

import Set exposing (Set)
import Html exposing (Html, div, button, text, p, span, br)
import Html.Events exposing (onClick)
import Random
import Extras
import AbstractDigraph exposing (AbstractDigraph)


widgetName : String
widgetName =
    "Random Graph"



--MODEL


type alias Model =
    { n : Int
    , edgeProbability : Float
    }


initialModel : Model
initialModel =
    { n = 40
    , edgeProbability = 0.05
    }



-- UPDATE


type Msg
    = Generate Model
    | GraphData (AbstractDigraph Int)


update : Msg -> Model -> ( Cmd Msg, Maybe (AbstractDigraph Int) )
update msg model =
    case msg of
        Generate { n, edgeProbability } ->
            let
                allPossibleEdges =
                    Set.fromList (List.range 1 model.n)
                        |> Extras.subsets 2
                        |> List.map Set.toList
                        |> List.map
                            (\e ->
                                case e of
                                    v :: w :: [] ->
                                        ( v, w )

                                    otherwise ->
                                        Debug.crash ""
                            )

                generator =
                    Random.float 0 1
                        |> Random.list (List.length allPossibleEdges)
                        |> Random.map
                            (\randomFloats ->
                                { vertexList = List.range 1 n
                                , edgeList =
                                    allPossibleEdges
                                        |> List.map2
                                            (\randomFloat edge ->
                                                if randomFloat < edgeProbability then
                                                    Just edge
                                                else
                                                    Nothing
                                            )
                                            randomFloats
                                        |> List.filterMap identity
                                }
                            )
            in
                ( Random.generate GraphData generator, Nothing )

        GraphData abstractDigraph ->
            ( Cmd.none, Just abstractDigraph )



-- VIEW


viewMenu : Model -> Html Msg
viewMenu model =
    div []
        [ button [ onClick (Generate model) ] [ text "Generate" ] ]
