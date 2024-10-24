import { PartialInquiry, inquirySchema } from '@/lib/schema/inquiry'
import { getModel } from '../utils'
import { streamObject } from 'ai'
import { BaseAgent } from './base-agent'
import { Copilot } from '@/components/copilot'
import { createStreamableValue } from '@/lib/streamable-value'

/**
 * InquiryAgent class handles the execution of inquiry tasks.
 * It uses the streamObject function to process the inquiry and updates the UI stream with the results.
 */
class InquiryAgent extends BaseAgent {
  async execute(): Promise<PartialInquiry> {
    const objectStream = createStreamableValue<PartialInquiry>()
    this.uiStream.append(<Copilot inquiry={objectStream.value} />)

    let finalInquiry: PartialInquiry = {}
    try {
      await streamObject({
        model: getModel(),
        system: `Your system prompt here`,
        messages: this.messages,
        schema: inquirySchema
      })
        .then(async result => {
          for await (const obj of result.partialObjectStream) {
            if (obj) {
              objectStream.update(obj)
              finalInquiry = obj
            }
          }
        })
        .finally(() => {
          objectStream.done()
        })
    } catch (error) {
      console.error('Error in streamObject:', error)
      objectStream.done()
    }

    return finalInquiry
  }
}

/**
 * LandUseAgent class handles the execution of land use tasks.
 * It currently has a placeholder implementation.
 */
class LandUseAgent extends BaseAgent {
  async execute(): Promise<any> {
    // Implement land use workflow
    return {}
  }
}

/**
 * EnvironmentAwareQueryAgent class handles the execution of environment-aware query tasks.
 * It currently has a placeholder implementation.
 */
class EnvironmentAwareQueryAgent extends BaseAgent {
  async execute(): Promise<any> {
    // Implement environment-aware query workflow
    return {}
  }
}

export { InquiryAgent, LandUseAgent, EnvironmentAwareQueryAgent }
