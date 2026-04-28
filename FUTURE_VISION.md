# Future vision

Podle mě se role vývojáře s nástupem agentní AI výrazně posune. Pokud AI zvládne napsat většinu kódu, hodnota vývojáře nebude hlavně v samotném psaní řádků, ale v tom, že dokáže správně určit, co se má stavět, proč se to má stavět a jak poznat, že výsledek opravdu dává smysl.

AI může výrazně zrychlit implementaci, refaktoring, tvorbu komponent, testů nebo dokumentace. Pořád ale nerozumí celému kontextu produktu, prioritám, kompromisům a dlouhodobým dopadům technických rozhodnutí. To je oblast, kde zůstává odpovědnost na vývojáři.

V této case study se mi potvrdilo, že AI funguje nejlépe, když dostane jasné zadání, konkrétní omezení a dobře popsaný cíl. Například vytvoření `AGENTS.md` nebo následné dílčí úpravy projektu fungovaly dobře, protože zadání bylo přesné. Naopak u vizuální implementace podle Figma designu bylo potřeba více iterací a ruční kontroly, protože výsledek se od návrhu snadno odchýlil.

Dobrý vývojář podle mě bude muset hlavně:

- rozdělit problém na menší smysluplné části,
- připravit kvalitní zadání pro AI agenty,
- kontrolovat architekturu a technická rozhodnutí,
- poznat rozdíl mezi funkčním a dlouhodobě udržitelným řešením,
- ověřovat výstupy AI místo jejich slepého přebírání.

Dobrým příkladem z mé práce byla změna architektury. Původně jsem projekt vedl jako jednu Next.js aplikaci, ale později jsem vyhodnotil, že lepší bude rozdělení na samostatné Express API a Next.js pouze jako prezentační frontend. AI tuto změnu zvládla implementovat, ale rozhodnutí, že původní návrh není ideální, muselo přijít ode mě.

Podobné to bylo u Prisma modelů. AI vytvořila funkční databázové modely, ale nepoužila mapování na PostgreSQL konvence pomocí `@@map` a `@map`. Kód by pravděpodobně fungoval, ale nebyl by tak čistý a konzistentní. To ukazuje, že vývojář musí výstup AI kontrolovat i ve chvíli, kdy na první pohled vypadá správně.

V budoucnu tedy podle mě nebude dobrý inženýr nahrazen tím, že AI píše kód. Spíš se jeho práce posune výš, bude navrhovat řešení, řídit AI workflow, kontrolovat kvalitu a nést odpovědnost za výsledek. AI může být velmi silný akcelerátor, ale bez jasného vedení může stejně rychle vytvářet i technický dluh.