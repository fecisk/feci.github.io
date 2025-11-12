// Súbor s definíciou všetkých lokácií

const viet = '#00674F'
const pizza = '#E86F30'
const zmrz = '#FFB6C1'

const locations = [
    {
        name: "Big Bowl",
        coords: [48.72119116092665, 21.260087687032104],
        description: "Ázijská reštaurácia s modernými jedlami a príjemnou atmosférou. Skvelé sushi a wok jedlá.",
        category: "Vietnam",
        price: "€€",        // € = lacné, €€ = stredné, €€€ = drahé
        rating: 4.5,        // Tvoje hodnotenie 0-5
        color: viet,
        photos: [
            "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500",
            "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500",
            "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=500",
            "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=500"
        ]
    },
    {
        name: "do Pizze !",
        coords: [48.72208528180286, 21.25768924497387],
        description: "Pizza slice shop",
        category: "Pizza",
        price: "€",        // € = lacné, €€ = stredné, €€€ = drahé
        rating: 4,        // Tvoje hodnotenie 0-5
        color: pizza,
        photos: [
            "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500",
            "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500",
            "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=500",
            "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=500"
        ]
    },
    {
        name: "Moritz Eis",
        coords: [48.72178561879827, 21.257953644836096],
        description: "Prémiová zmrzlina",
        category: "Zmrzlina",
        price: "€€€",        // € = lacné, €€ = stredné, €€€ = drahé
        rating: 4,        // Tvoje hodnotenie 0-5
        color: zmrz,
        photos: [
            "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500",
            "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500",
            "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=500",
            "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=500"
        ]
    },
    {
        name: "Pub Cerberos",
        coords: [48.73793136256612, 21.28757146814902],
        description: "Pizza pub",
        category: "Pizza",
        price: "€€",        // € = lacné, €€ = stredné, €€€ = drahé
        rating: 3.6,        // Tvoje hodnotenie 0-5
        color: pizza,
        photos: [
            "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500",
            "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500",
            "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=500",
            "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=500"
        ]
    },
    {
        name: "Včielka",
        coords: [48.672342642213174, 21.312238122231744],
        description: "Pizza pub",
        category: "Pizza",
        price: "€€",        // € = lacné, €€ = stredné, €€€ = drahé
        rating: 5,        // Tvoje hodnotenie 0-5
        color: pizza,
        photos: [
            "https://i.ibb.co/rKb0NfvX/stiahnu.jpg",
            "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500",
            "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=500",
            "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=500"
        ]
    },
    
    // Formát pre pridávanie nových lokácií:
    // {
    //     name: "Názov miesta",
    //     coords: [zemepisná_šírka, zemepisná_dĺžka],
    //     description: "Podrobný popis miesta",
    //     category: "Kategória",      // Reštaurácie, Kaviarne, Pamiatky, Kultúra, Šport, Príroda
    //     price: "€€",                // €, €€, alebo €€€
    //     rating: 4.5,                // Tvoje hodnotenie 0-5 (môže byť aj 0.5, 1.5, atď.)
    //     color: "#hex_farba",
    //     photos: [
    //         "url_fotky1",
    //         "url_fotky2"
    //     ]
    // }

];
