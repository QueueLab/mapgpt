import { upstash } from '@upstash/qstash'

class AgentCoordinator {
  private upstash: typeof upstash

  constructor() {
    this.upstash = upstash({ token: process.env.UPSTASH_TOKEN })
  }

  /**
   * Executes the specified workflow using the appropriate agent and stores the result in Upstash QStash.
   * @param {string} workflowType - The type of workflow to execute.
   * @param {ReturnType<typeof createStreamableUI>} uiStream - The UI stream to update with the results.
   * @param {CoreMessage[]} messages - The messages to process.
   * @returns {Promise<any>} - The result of the workflow execution.
   */
  async executeWorkflow(workflowType: string, uiStream: ReturnType<typeof createStreamableUI>, messages: CoreMessage[]) {
    const agent = AgentFactory.createAgent(workflowType, uiStream, messages)
    let result

    try {
      result = await agent.execute()
    } catch (error) {
      console.error('Error in agent execution:', error)
      result = { error: 'Agent execution failed' }
    }

    try {
      // Store result in Upstash QStash for RAG
      await this.upstash.publishJSON({
        topic: 'agent-results',
        body: {
          workflowType,
          result,
          timestamp: new Date().toISOString(),
          location: messages.find(m => m.role === 'system')?.content // Assuming location is passed in system message
        }
      })
    } catch (error) {
      console.error('Error in publishJSON:', error)
    }

    return result
  }
}
