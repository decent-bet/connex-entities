import { ConnexContract, GetMethod, Read } from '../ConnexContractDecorators'
import { ContractService } from '../ContractService'
import { EnergyTokenContract } from '../examples/EnergyContractService'
import { IConnexMethodOrEventCall } from '../types'

@ConnexContract({
    import: {
        address: [{ a: 1 }],
        raw: {
            abi: {}
        }
    }
})
class Test {}

describe('Connex Entities', () => {
    describe('#ConnexContract', () => {
        it('should create a class with a ContractService property', async () => {
            const instance = (new Test() as any).contractService
            expect(instance instanceof ContractService).toBe(true)
        })

        it('should create a GetMethod() and return a Connex.Thor.VMOutput', async () => {
            // Mock
            const obj = {
                contractService: {
                    getMethod: jest.fn((name, add) => {
                        return Promise.resolve({} as Connex.Thor.VMOutput)
                    })
                }
            }
            const options: IConnexMethodOrEventCall = {}
            const descriptor = GetMethod(options)
            const original = {}
            const pd = descriptor(null, 'balanceOf', original)

            const promise = pd.value.bind(obj)()
            expect(obj.contractService.getMethod.mock.calls.length).toBe(1)
        })

        it('should create a Read() and return an object', async () => {
            // Mock
            const obj = {
                contractService: {
                    getMethod: jest.fn(i => {
                            return {
                                call: jest.fn(i => Promise.resolve({ decoded: { 0: true } }))
                            }
                        })
                    
                }
            };
            const options: IConnexMethodOrEventCall = {}
            const descriptor = Read(options)
            const original = {}
            const pd = descriptor(null, 'balanceOf', original)

            const promise = await pd.value.bind(obj)()
            expect(obj.contractService.getMethod.mock.calls.length).toBe(1)
        })
    })
})
