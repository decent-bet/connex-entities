import {
    ConnexContract,
    GetMethod,
    Read,
    GetEventSignature,
    GetMethodSignature
} from '../ConnexContractDecorators';
import { ContractService } from '../ContractService';
import { EnergyTokenContract } from '../examples/EnergyContractService';
import { IConnexMethodOrEventCall } from '../types';
import { AbiUtils } from '../Utils';

const abiMethod = {
    constant: false,
    inputs: [
        {
            name: '_to',
            type: 'address'
        },
        {
            name: '_amount',
            type: 'uint256'
        }
    ],
    name: 'transfer',
    outputs: [
        {
            name: 'success',
            type: 'bool'
        }
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
};
const abiEvent = {
    anonymous: false,
    inputs: [
        {
            indexed: true,
            name: '_from',
            type: 'address'
        },
        {
            indexed: true,
            name: '_to',
            type: 'address'
        },
        {
            indexed: false,
            name: '_value',
            type: 'uint256'
        }
    ],
    name: 'Transfer',
    type: 'event'
};

@ConnexContract({
    import: {
        address: [{ a: 1 }],
        raw: {
            abi: [
                {
                    anonymous: false,
                    inputs: [
                        {
                            indexed: true,
                            name: '_from',
                            type: 'address'
                        },
                        {
                            indexed: true,
                            name: '_to',
                            type: 'address'
                        },
                        {
                            indexed: false,
                            name: '_value',
                            type: 'uint256'
                        }
                    ],
                    name: 'Transfer',
                    type: 'event'
                }
            ]
        }
    }
})
class Test {}

describe('Connex Entities', () => {
    describe('#ConnexContract', () => {
        it('should create a class with a ContractService property', async () => {
            const instance = (new Test() as any).contractService;
            expect(instance instanceof ContractService).toBe(true);
        });

        it('should create a GetMethod() and return a Connex.Thor.VMOutput', async () => {
            // Mock
            const obj = {
                contractService: {
                    getMethod: jest.fn((name, add) => {
                        return Promise.resolve({} as Connex.Thor.VMOutput);
                    })
                }
            };
            const options: IConnexMethodOrEventCall = {};
            const descriptor = GetMethod(options);
            const original = {};
            const pd = descriptor(null, 'balanceOf', original);

            const promise = pd.value.bind(obj)();
            expect(obj.contractService.getMethod.mock.calls.length).toBe(1);
        });

        it('should create a Read() and return an object', async () => {
            // Mock
            const obj = {
                contractService: {
                    getMethod: jest.fn(i => {
                        return {
                            call: jest.fn(i =>
                                Promise.resolve({ decoded: { 0: true } })
                            )
                        };
                    })
                }
            };
            const options: IConnexMethodOrEventCall = {};
            const descriptor = Read(options);
            const original = {};
            const pd = descriptor(null, 'balanceOf', original);

            const promise = await pd.value.bind(obj)();
            expect(obj.contractService.getMethod.mock.calls.length).toBe(1);
        });

        it('should create a GetEventSignature() and return a string', async () => {
            // Mock
            const obj = {
                contractService: {
                    getAbiMethod: () => abiEvent
                }
            };
            const descriptor = GetEventSignature();
            const original = {};
            const pd = descriptor(null, 'Transfer', original);

            const signature = await pd.value.bind(obj)();
            expect(signature).toBe(
                AbiUtils.encodeEventSignature(
                    `Transfer(address,address,uint256)`
                )
            );
        });

        it('should create a GetMethodSignature() and return a string', async () => {
            // Mock
            const obj = {
                contractService: {
                    getAbiMethod: () => abiMethod
                }
            };
            const descriptor = GetMethodSignature();
            const original = {};
            const pd = descriptor(null, 'transfer', original);

            const signature = await pd.value.bind(obj)();
            expect(signature).toBe(
                AbiUtils.encodeFunctionSignature(
                    `transfer(address,uint256)`
                )
            );
        });
    });
});
