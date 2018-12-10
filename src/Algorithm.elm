module Algorithm exposing (Algorithm, StepResult(..), basic, run)


type Algorithm inputData stepData
    = Algorithm
        { init : inputData -> stepData
        , step : inputData -> stepData -> StepResult stepData
        }


type StepResult stepData
    = Next stepData
    | End


basic initAndStep =
    Algorithm initAndStep


{-| stepData must hold all information for the visualization of that step.
-}
run : Algorithm inputData stepData -> inputData -> List stepData
run (Algorithm { init, step }) inputData =
    let
        helper lastStepData past =
            case step inputData lastStepData of
                Next nextStepData ->
                    helper nextStepData (lastStepData :: past)

                End ->
                    lastStepData :: past
    in
    List.reverse
        (helper (init inputData) [])
