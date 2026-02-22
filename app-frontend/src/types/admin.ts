export interface Campus {
    id: number;
    name: string;
    address: string;
    cityId?: number;
    cityName?: string;
}

export interface Promotion {
    id: number;
    name: string;
    description: string;
    startYear: number;
    endYear: number;
}

export interface Grade {
    id: number;
    name: string;
    description: string;
}
