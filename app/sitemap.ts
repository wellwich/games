import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    return [{
        url: "https://games.wellwich.com",
        lastModified: new Date()
    }, {
        url: "https://games.wellwich.com/games",
        lastModified: new Date()
    }, {
        url: "https://games.wellwich.com/games/sichuan",
        lastModified: new Date()
    },
    {
        url: "https://games.wellwich.com/games/lightsout",
        lastModified: new Date()
    }];
}

export const runtime = "edge";