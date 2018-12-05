module Algorithm exposing (Algorithm, StepResult(..), basic, run)


type Algorithm inputData stepData vizData
    = Algorithm
        { init : inputData -> ( stepData, vizData )
        , step : inputData -> stepData -> StepResult stepData vizData
        }


type StepResult stepData vizData
    = Next ( stepData, vizData )
    | End


basic initAndStep =
    Algorithm initAndStep


{-| stepData must hold all information for the visualization of that step.
-}
run :
    Algorithm inputData stepData vizData
    -> inputData
    -> List ( stepData, vizData )
run (Algorithm { init, step }) inputData =
    let
        helper :
            ( stepData, vizData )
            -> List ( stepData, vizData )
            -> List ( stepData, vizData )
        helper lD past =
            case step inputData (Tuple.first lD) of
                Next nD ->
                    helper nD (lD :: past)

                End ->
                    lD :: past
    in
    helper (init inputData) []
        |> List.reverse
