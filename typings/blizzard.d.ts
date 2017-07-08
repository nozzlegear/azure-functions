declare module "blizzard" {
    export interface RealmStatuses {
        data: {
            realms: Realm[]
        }
    }

    export interface Realm {
        name: string;
        population: string;
        type: string;
        slug: string;
        queue: boolean;
    }
}