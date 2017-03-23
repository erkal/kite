port module Widgets exposing (..)

import Dict exposing (Dict)


-- MODEL


type alias Model =
    { widgetDict : Dict String { visible : Bool, expanded : Bool }
    , maybeNameOfTheActiveWidget : Maybe String
    }


initialModel : List String -> Model
initialModel widgetNames =
    { widgetDict =
        widgetNames
            |> List.map (\str -> ( str, { visible = True, expanded = False } ))
            |> Dict.fromList
    , maybeNameOfTheActiveWidget =
        Just "Select and Edit"
    }



-- UPDATE


type Msg
    = Filter String
    | Activate String
    | SwitchExpanded String


update : Msg -> Model -> Model
update msg ({ widgetDict, maybeNameOfTheActiveWidget } as model) =
    case msg of
        Filter str ->
            let
                isToShow =
                    String.toLower >> String.contains (String.toLower str)

                setVisibility name w =
                    if isToShow name then
                        { w | visible = True }
                    else
                        { w | visible = False }

                newWidgetDict =
                    widgetDict |> Dict.map setVisibility

                newModel =
                    { model
                        | widgetDict = newWidgetDict
                        , maybeNameOfTheActiveWidget =
                            newWidgetDict |> Dict.keys |> List.head
                    }
            in
                newModel

        Activate widgetName ->
            let
                newModel =
                    { model | maybeNameOfTheActiveWidget = Just widgetName }
            in
                newModel

        SwitchExpanded widgetName ->
            let
                switch w =
                    { w | expanded = not w.expanded }

                newModel =
                    { model | widgetDict = widgetDict |> Dict.update widgetName (Maybe.map switch) }
            in
                newModel
