const baseUrl = '/submit-steps';
const baseComponentPath = 'SubmitSteps';
const middleComponentPathRecording = 'RecordingsSteps';
const middleComponentPathQuestionary = 'Questionary';
const middleComponentPathSubmission = 'Submission';
const recordYourCoughLogic = 'recordYourCough';
const recordYourSpeechLogic = 'recordYourSpeech';

export const removeSpeechIn: string[] = [
  'Argentina',
  'Bolivia',
  'Brazil',
  // 'Colombia',
  'Mexico',
  'Peru',
  'United States',
];
export const removeQuestionaryStep6In: string[] = [];

function getWizardData() {
  try {
    const output = JSON.parse(window.localStorage.getItem('VirufyWizard') || '{}');
    return output;
  } catch {
    return {};
  }
}

export function getCountry() {
  const data = getWizardData();
  return data?.welcome?.country ?? '';
}

export function getPatientId() {
  const data = getWizardData();
  return data?.welcome?.patientId ?? '';
}

export function getSpeechContext() {
  const country = getCountry();
  if (removeSpeechIn.includes(country)) {
    return 'cough';
  }
  return 'voice';
}

function getCoughSteps(storeKey: string, country: string, patientId?: string) {
  return [
    {
      path: '/step-record/cough',
      componentPath: `${baseComponentPath}/${middleComponentPathRecording}/Introduction`,
      props: {
        storeKey,
        previousStep: patientId ? '/welcome/patientSummary' : '/welcome/step-5',
        nextStep: `${baseUrl}/step-listen/cough`,
        otherSteps: {
          manualUploadStep: `${baseUrl}/step-manual-upload/cough`,
        },
        metadata: {
          currentLogic: recordYourCoughLogic,
        },
      },
    },
    {
      path: '/step-manual-upload/cough',
      componentPath: `${baseComponentPath}/${middleComponentPathRecording}/RecordManualUpload`,
      props: {
        storeKey,
        previousStep: `${baseUrl}/step-record/cough`,
        nextStep: `${baseUrl}/step-listen/cough`,
        metadata: {
          currentLogic: recordYourCoughLogic,
        },
      },
    },
    {
      path: '/step-listen/cough',
      componentPath: `${baseComponentPath}/${middleComponentPathRecording}/ListenAudio`,
      props: {
        storeKey,
        previousStep: `${baseUrl}/step-record/cough`,
        nextStep: (() => {
          if (removeSpeechIn.includes(country)) {
            if (patientId) {
              return '/thank-you';
            }
            return `${baseUrl}/questionary/step1a`;
          }
          return `${baseUrl}/step-record/speech`;
        })(),
        metadata: {
          currentLogic: recordYourCoughLogic,
        },
      },
    },
  ];
}

function getSpeechSteps(storeKey: string, country: string, patientId: string) {
  if (removeSpeechIn.includes(country)) {
    return [];
  }
  return [
    {
      path: '/step-record/speech',
      componentPath: `${baseComponentPath}/${middleComponentPathRecording}/Introduction`,
      props: {
        storeKey,
        previousStep: `${baseUrl}/step-listen/cough`,
        nextStep: `${baseUrl}/step-listen/speech`,
        otherSteps: {
          manualUploadStep: `${baseUrl}/step-manual-upload/speech`,
        },
        metadata: {
          currentLogic: recordYourSpeechLogic,
        },
      },
    },
    {
      path: '/step-manual-upload/speech',
      componentPath: `${baseComponentPath}/${middleComponentPathRecording}/RecordManualUpload`,
      props: {
        storeKey,
        previousStep: `${baseUrl}/step-record/speech`,
        nextStep: `${baseUrl}/step-listen/speech`,
        metadata: {
          currentLogic: recordYourSpeechLogic,
        },
      },
    },
    {
      path: '/step-listen/speech',
      componentPath: `${baseComponentPath}/${middleComponentPathRecording}/ListenAudio`,
      props: {
        storeKey,
        previousStep: `${baseUrl}/step-record/speech`,
        nextStep: patientId ? '/thank-you' : `${baseUrl}/questionary/step1a`,
        metadata: {
          currentLogic: recordYourSpeechLogic,
        },
      },
    },
  ];
}

function getQuestionarySteps(storeKey: string, country: string, patientId: string) {
  const baseMetadata = {
    total: (() => {
      if (!removeQuestionaryStep6In.includes(country)) {
        if (patientId) {
          return 7;
        }
        return 8;
      }
      return 7;
    })(),
    progressCurrent: removeSpeechIn.includes(country) ? 1 : 2,
    progressTotal: removeSpeechIn.includes(country) ? 1 : 2,
  };
  const output = [
    {
      path: '/questionary/step1a',
      componentPath: `${baseComponentPath}/${middleComponentPathQuestionary}/Step1a`,
      props: {
        storeKey,
        previousStep: removeSpeechIn.includes(country) ? `${baseUrl}/step-listen/cough` : `${baseUrl}/step-listen/speech`,
        nextStep: `${baseUrl}/questionary/step1b`,
        otherSteps: {
          noTestStep: `${baseUrl}/questionary/step2`,
        },
        metadata: {
          patientId,
          current: 1,
          ...baseMetadata,
        },
      },
    },
    {
      path: '/questionary/step1b',
      componentPath: `${baseComponentPath}/${middleComponentPathQuestionary}/Step1b`,
      props: {
        storeKey,
        previousStep: patientId ? '/welcome/patientSummary' : `${baseUrl}/questionary/step1a`,
        nextStep: patientId ? '/welcome/patientSummary' : `${baseUrl}/questionary/step2`,
        metadata: {
          ...baseMetadata,
        },
      },
    },
    {
      path: '/questionary/step2',
      componentPath: `${baseComponentPath}/${middleComponentPathQuestionary}/Step2`,
      props: {
        storeKey,
        previousStep: patientId ? '/welcome/patientSummary' : `${baseUrl}/questionary/step1b`,
        nextStep: `${baseUrl}/questionary/step2a`,
        otherSteps: {
          noTestStep: `${baseUrl}/questionary/step1a`,
        },
        metadata: {
          current: patientId ? 1 : 2,
          ...baseMetadata,
        },
      },
    },
    {
      path: '/questionary/step2a',
      componentPath: `${baseComponentPath}/${middleComponentPathQuestionary}/Step2a`,
      props: {
        storeKey,
        previousStep: `${baseUrl}/questionary/step2`,
        nextStep: `${baseUrl}/questionary/step2b`,
        metadata: {
          current: patientId ? 2 : 3,
          ...baseMetadata,
        },
      },
    },
    {
      path: '/questionary/step2b',
      componentPath: `${baseComponentPath}/${middleComponentPathQuestionary}/Step2b`,
      props: {
        storeKey,
        previousStep: `${baseUrl}/questionary/step2a`,
        nextStep: `${baseUrl}/questionary/step2c`,
        metadata: {
          current: patientId ? 3 : 4,
          ...baseMetadata,
        },
      },
    },
    {
      path: '/questionary/step2c',
      componentPath: `${baseComponentPath}/${middleComponentPathQuestionary}/Step2c`,
      props: {
        storeKey,
        previousStep: `${baseUrl}/questionary/step2b`,
        nextStep: `${baseUrl}/questionary/step3`,
        metadata: {
          current: patientId ? 4 : 5,
          ...baseMetadata,
        },
      },
    },
    {
      path: '/questionary/step3',
      componentPath: `${baseComponentPath}/${middleComponentPathQuestionary}/Step3`,
      props: {
        storeKey,
        previousStep: `${baseUrl}/questionary/step2c`,
        nextStep: `${baseUrl}/questionary/step4a`,
        metadata: {
          current: patientId ? 5 : 6,
          ...baseMetadata,
        },
      },
    },
    {
      path: '/questionary/step4a',
      componentPath: `${baseComponentPath}/${middleComponentPathQuestionary}/Step4a`,
      props: {
        storeKey,
        previousStep: `${baseUrl}/questionary/step3`,
        nextStep: `${baseUrl}/questionary/step5`,
        otherSteps: {
          covidSymptomsStep: `${baseUrl}/questionary/step4b`,
        },
        metadata: {
          current: patientId ? 6 : 7,
          ...baseMetadata,
        },
      },
    },
    {
      path: '/questionary/step4b',
      componentPath: `${baseComponentPath}/${middleComponentPathQuestionary}/Step4b`,
      props: {
        storeKey,
        previousStep: `${baseUrl}/questionary/step4a`,
        nextStep: `${baseUrl}/questionary/step6`,
        metadata: {
          ...baseMetadata,
        },
      },
    },
    /* {
      path: '/questionary/step5',
      componentPath: `${baseComponentPath}/${middleComponentPathQuestionary}/Step5`,
      props: {
        storeKey,
        previousStep: `${baseUrl}/questionary/step4a`,
        nextStep: removeQuestionaryStep6In.includes(country)
          ? `${baseUrl}/thank-you`
          : `${baseUrl}/questionary/step6`,
        metadata: {
          current: 8,
          ...baseMetadata,
        },
      },
    }, */
  ];

  if (!removeQuestionaryStep6In.includes(country)) {
    output.push({
      path: '/questionary/step6',
      componentPath: `${baseComponentPath}/${middleComponentPathQuestionary}/Step6`,
      props: {
        storeKey,
        previousStep: `${baseUrl}/questionary/step`,
        nextStep: `${baseUrl}/thank-you`,
        metadata: {
          current: patientId ? 7 : 8,
          ...baseMetadata,
        },
      },
    });
  }
  return output;
}

export default function stepsDefinition(storeKey: string, country: string, patientId: string) {
  const steps: Wizard.Step[] = [
    // Record Your Cough Steps
    ...getCoughSteps(storeKey, country, patientId),
    // Record Your Speech Steps
    ...getSpeechSteps(storeKey, country, patientId),
    // Questionary
    ...getQuestionarySteps(storeKey, country, patientId),
    {
      path: '/thank-you',
      componentPath: `${baseComponentPath}/${middleComponentPathSubmission}/ThankYou`,
      props: {
        storeKey,
        previousStep: `${baseUrl}/before-submit`,
        nextStep: '/welcome',
      },
    },
  ];

  return steps;
}
