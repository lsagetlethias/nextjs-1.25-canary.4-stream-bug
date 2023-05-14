import { Suspense } from 'react';
import { ClientAnimate } from './ClientAnimate';
import { times } from 'lodash';
import { NextPageLink } from './NextPageLink';
import Image from 'next/image';
import packageJson from "../../package.json";

export const dynamic = "force-dynamic"; // should be implicit by the use of "searchParams"

interface SearchParams {page: string, limit: string};
export default function RootPage({searchParams}: {searchParams: SearchParams}) {
    let {page, limit = "10"} = searchParams;

    return <div>
        <h1>stream bug (current version: {packageJson.dependencies.next})</h1>
        <ClientAnimate>
            <Suspense fallback={<div>Loading results...</div>}>
                {/* @ts-ignore */}
                <DisplayResults page={page} limit={limit} />
            </Suspense>
        </ClientAnimate>
    </div>
}

interface Product {
    "id": number,
    "title": string,
    "description": string,
    "thumbnail": string,
}
interface Result {
  "products": Product[],
  "total": number,
  "skip": number,
  "limit": number
}

const search = async ({page, limit}: SearchParams) => {
    const skip = +page > 0 ? +page * +limit : 0;
    const response = await fetch(`https://dummyjson.com/products?limit=${limit}&skip=${skip}`, {
        next: {
            revalidate: 0
        }
    });
    if (!response.ok) throw new Error("Should be ok for repro.");
    return response.json() as Promise<Result>;
}

const DisplayResults = async ({page, limit}: SearchParams) => {
    const resultPage0 = await search({page: "0", limit});
    const totalCount = resultPage0.total;

    if (totalCount === 0) {
        return <div>No results.</div>
    }

    let cumulLength = resultPage0.products.length;
    const pages = await Promise.all(
        times(+page, async i => {
            const result = await search({limit, page: `${i + 1}`});
            cumulLength += result.products.length;

            // @ts-ignore
            return <PaginationDisplay result={result} key={i + 1} />
        })
    );

    return <>
        <h2>{`${cumulLength} ${totalCount > +limit ? `of ${totalCount}` : ""} result${totalCount > 1 ? "s" : ""}`}</h2>
        <ClientAnimate>
            {/* @ts-ignore */}
            <PaginationDisplay result={resultPage0} />
            {pages}
        </ClientAnimate>
        {cumulLength < totalCount && <Suspense>
            <NextPageLink />
        </Suspense>}
    </>;
}

const PaginationDisplay = async ({result}: {result: Result}) => {
    return result.products.map(product => <div key={product.id} style={{height: 100, width: 250, position: "relative", overflow: "hidden"}}>
        <Image alt={product.title} src={product.thumbnail} fill style={{objectFit: "contain"}} />
    </div>)
}