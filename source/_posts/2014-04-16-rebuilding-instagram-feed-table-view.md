---
layout: post
title: "Rebuilding Instagram Feed Table View"
description: "Analysis of Instagram feed table view as an inspiration for styleXstyle."
date: 2014-04-16
author: jessearmand
categories: [ios, instagram, uitableview, stylexstyle]
---

## Background

[Instagram](http://instagram.com) is what we have all known as one of the best apps to take a picture and share it on-the-go. It is simple, fast and intuitive, yet it doesn't lack the features — camera, simple image editing, and filters — that most people would need from a photography app. However, a photography app would be incomplete without an ability to share what the user had done to their friends, family, followers, or the general public.

Sharing is the key feature of Instagram that has gained lots of users from all backgrounds and culture, regardless of their photography skills. Thus, we're going to take a look at instagram feed, which is where most users will spend their time with.

## Analysis

[Instagram](http://instagram.com) feed is unique in a way that it's able to provide lots of important information in a condensed space without overwhelming its user.

If we take a look at each section where it displays text, #hashtags and @username mentions are the way in which a user is sharing what they have in mind — either a description of the picture, or a comment to another picture. Users would like another user to know, and they would also like the general public to know by marking it with a #hashtag.

We took this idea as a design inspiration for [styleXstyle](http://www.stylexstyle.com/news-events/the-hottest-fashion-app-you-need-to-download.html) — a mobile app that showcases fashion and styles from its users with sharing as one of its key features.

## Dissecting

Initially, it's easier and more intuitive to think of the feed layout as a series of posts listed in a table view. Each post contains a picture, caption, likes, comments, and the typical sharing buttons at the bottom.

A picture will take the size of the whole row and it intersects with a profile picture of the person who owns the post. For styleXstyle, the picture is followed by a list of outfits or accessories showcased in the picture — with a link to an online store which is selling the particular item. Onwards, it's followed by the caption, likes, comments, and sharing buttons. This is a similar layout, yet still a bit different compared to Instagram.

![styleXstyle table view post](/media/2014-04-16-rebuilding-instagram-feed-table-view/images/stylexstyle-post.png)

From this layout, we thought it's beneficial to use Auto Layout, which has been released since iOS 6 SDK, and it gains lots of improvements since Xcode 5 with iOS 7 SDK. We could've taken the traditional approach of manually laying out each view by calculating frames.

Manual layout could be an advantage from <code>Core Animation</code> performance's point of view. But, it will add an unnecessary complexity that arise from ensuring that the view frames calculation is correct in every situation that could happen such as text size adjustments, or a change in the layout structure (switching the position of caption with the store items).

There's a good post on [table view cells with dynamic heights](http://johnszumski.com/blog/auto-layout-for-table-view-cells-with-dynamic-heights) which has tried both approaches (manual and auto layout) with a useful result that we can use.

## Starting Up and Initial Problems

To begin with, we created a subclass of <code>UITableViewCell</code> which represents a big cell that contains the individual post. From this one big cell it's easy to follow that we only need to layout all of the content, relative to each other inside the <code>UITableViewCell</code>'s <code>contentView</code>. But soon we discovered that there's an inherent complexity resulting from this nested hierarchy of <code>UIView</code>s.

A minimal post contains a photo, caption, one item, and the buttons. The number of items, likes and comments will vary depending on the user's post. Knowing this, we need to adjust layout constraints at runtime depending on how many items, likes, or comments that a post will have. A declared layout in an interface builder file is not enough to satisfy these dynamic constraints.

This way it easily generates a structure of code similar to the following:

{% highlight objc linenos %}
- (void)layoutItemViewsFromItems:(NSArray *)items
{
    [self invalidateIntrinsicContentSize];

    NSUInteger storeItemIndex = 1;

    for (STXStoreItem *storeItem in items) {
        NSArray *topLevelObjects = [self.storeItemViewNib instantiateWithOwner:self options:nil];
        if ([topLevelObjects count] > 0) {
            NSInteger viewTag = storeItemIndex > FIRST_ITEM_VIEW_TAG ? storeItemIndex-1 : FIRST_ITEM_VIEW_TAG;
            STXStoreItemCell *previousItemView = (STXStoreItemCell *)[self viewWithTag:viewTag];
            STXStoreItemCell *nextItemView;

            if (previousItemView == nil) {
                UIView *topSeparatorView = [self addTopSeparatorToView];
                topSeparatorView.hidden = !self.shouldAddTopSeparator;

                previousItemView = topLevelObjects[0];
                previousItemView.tag = FIRST_ITEM_VIEW_TAG;
                previousItemView.storeItem = storeItem;
                previousItemView.delegate = self;
                [self addSubview:previousItemView];

                previousItemView.translatesAutoresizingMaskIntoConstraints = NO;

                [previousItemView autoPinEdge:ALEdgeTop toEdge:ALEdgeBottom ofView:topSeparatorView withOffset:STXItemViewTopEdgeInset];
                [previousItemView autoPinEdgeToSuperviewEdge:ALEdgeLeading withInset:0];
                [previousItemView autoPinEdgeToSuperviewEdge:ALEdgeTrailing withInset:0];

                if ([items count] == 1) {
                    UIView *bottomSeparatorView = [self addBottomSeparatorToView];
                    bottomSeparatorView.hidden = !self.shouldAddBottomSeparator;
                    [bottomSeparatorView autoPinEdge:ALEdgeTop toEdge:ALEdgeBottom ofView:previousItemView withOffset:STXItemViewBottomEdgeInset];
                }
            } else {
                nextItemView = topLevelObjects[0];
                nextItemView.tag = storeItemIndex;
                nextItemView.storeItem = storeItem;
                nextItemView.delegate = self;
                [self addSubview:nextItemView];

                nextItemView.translatesAutoresizingMaskIntoConstraints = NO;

                [nextItemView autoPinEdge:ALEdgeTop toEdge:ALEdgeBottom ofView:previousItemView];
                [nextItemView autoPinEdge:ALEdgeLeading toEdge:ALEdgeLeading ofView:previousItemView];
                [nextItemView autoPinEdge:ALEdgeTrailing toEdge:ALEdgeTrailing ofView:previousItemView];

                if (storeItemIndex == [items count]) {
                    UIView *bottomSeparatorView = [self addBottomSeparatorToView];
                    bottomSeparatorView.hidden = !self.shouldAddBottomSeparator;
                    [bottomSeparatorView autoPinEdge:ALEdgeTop toEdge:ALEdgeBottom ofView:nextItemView withOffset:STXItemViewBottomEdgeInset];
                }
            }
        }

        ++storeItemIndex;
    }
}
{% endhighlight %}

The above code snippet works, but it's quite hard to comprehend. Moreover, if we want to understand whether there's any layout constraints problems resulting from it — we've already used [UIView-AutoLayout](https://github.com/smileyborg/UIView-AutoLayout) that's simpler to use compared to the Auto Layout's visual format syntax.

There's a solution to this code smell in the following section. Next, we tackle dynamic content height.

## Dynamic Cell Content Height

Each post has a different content, and it will affect the overall size of the text components being displayed (caption, name of items, who likes the post, comments). Thus, it follows that each cell may have a different height.

To solve this, each cell is cached with <code>NSCache</code>.

{% highlight objc linenos %}
- (STXFeedCell *)feedCellForTableView:(UITableView *)tableView atIndexPath:(NSIndexPath *)indexPath
{
    NSString *identifier = [NSString stringWithFormat:@"STXFeedCell-%@-%p", @(indexPath.section), tableView];
    STXFeedCell *cell = [self.feedCells objectForKey:identifier];
    if (cell == nil) {
        cell = [[self.feedCellNib instantiateWithOwner:self options:nil] firstObject];

        cell.indexPath = indexPath;
        cell.delegate = self.controller;

        if (indexPath.section < [self.posts count]) {
            STXPost *post = self.posts[indexPath.section];
            cell.post = post;
        }

        [self.feedCells setObject:cell forKey:identifier];
    }

    return cell;
}
{% endhighlight %}

From a few experiments with the <code>UITableView</code> queueing system, it's just too hard to make sure that each row of table view has the correct height, and it's not reusing the wrong cell. Also, because we've started layout with Interface Builder and Storyboard, it's not possible to use different identifier for different cells, unless if we create separate cells, which will create unnecessary IB files.

Reconstructing the cell layout constraints and re-calculating the height every time we dequeued a cell from a table view is also not a good idea, because it means the layout engine has to do extra work on each row.

How did we get the height for each row? It's actually done by the magic of Auto Layout's <code>-[UIView systemLayoutSizeFittingSize:]</code>, which queries the layout engine for a valid layout of the view that fits as close to the given size as possible. It is used in <code>tableView:heightForRowAtIndexPath:</code> and given <code>UILayoutFittingCompressedSize</code>, which ensures the calculated size is the smallest possible that fits the contents.

Other than the post by [John Szumski](http://johnszumski.com/blog/auto-layout-for-table-view-cells-with-dynamic-heights), there are series of StackOverflow answers by Tyler Fox which comprehensively detailed how to construct a table view with dynamic cells height utilizing Auto Layout. A github project is available [here](https://github.com/smileyborg/TableViewCellWithAutoLayout).

We've been working with this implementation for about a month. It's capable to display a feed cell with dynamic content, but somehow it's lacking what we originally intend to achieve with Auto Layout. Core Animation performance (when the user scrolls) is suboptimal, and the idea of *simplicity* that we want to achieve with declarative layout doesn't complement the effort that we need to do to optimize it.

## Back to Instagram

From this realization, we need to think of smarter ways to solve this. First, there's one noticeable characteristic of the Instagram table view, the profile picture, username, and date are scrolling independently from the rest of the content view in the cell when it's being scrolled. This gives us the idea that this must be a section header view. While styleXstyle doesn't have this section header view, it's still a good idea to explore the use of table view sections to separate each post.

Then, we overlooked that there's a way to examine how Instagram build the content feed. To do this, we've used the commonly known way to [inspect 3rd party apps](http://petersteinberger.com/blog/2013/how-to-inspect-the-view-hierarchy-of-3rd-party-apps/).


<video autoplay="true" loop="true" width="100%"><source src="/media/2014-04-16-rebuilding-instagram-feed-table-view/videos/instagram-feed.m4v" type="video/x-m4v"></source><source src="/media/2014-04-16-rebuilding-instagram-feed-table-view/videos/instagram-feed.webm" type="video/webm"></source></video>


As demonstrated by the above video, each post is separated by a section, and each section consists of different types of cells that correspond to the type of content (photo, video, text, action, or header). There's no separation of likes, comments, or caption at the <code>UITableViewCell</code> level.

We can also see that there's no ornamentation (no borders) surrounding the content, each text content has the same characteristics and styling. The bold font could represent number of likes or username. Every text could contain a #hashtag or @username mentions. It simplifies the effort needed to reuse the code, and it also simplifies the amount of processing that needs to be done by the table view.

From the view hierarchy of instagram feed, it's a sudden realization that this is a better way to structure the table view section. Once we understand this, it should be very obvious from the start, but somehow we didn't come up with that solution in the first place.

Following this is a step-by-step refactoring on the existing styleXstyle codebase, starting with separating the profile picture, username, date, and photo into a separate UITableViewCell, then we separated out the store items into its own cell, to avoid the notorious code smell that was shown above. Other than the benefit of modularity, and code that's easier to understand, it reduces the overhead of <code>-[UIView systemLayoutSizeFittingSize:]</code> calculation.

Previously, the following is done for each section of the table view:

{% highlight objc linenos %}
    - (CGFloat)tableView:(UITableView *)tableView heightForRowAtIndexPath:(NSIndexPath *)indexPath
    {
        STXFeedCell *cell = [self feedCellAtIndexPath:indexPath];

        cell.bounds = CGRectMake(0, 0, CGRectGetWidth(tableView.bounds), CGRectGetHeight(cell.bounds));

        [cell setNeedsLayout];
        [cell layoutIfNeeded];

        CGSize cellSize = [cell.contentView systemLayoutSizeFittingSize:UILayoutFittingCompressedSize];

        // Add extra padding
        CGFloat height = cellSize.height + 1;

        return height;
    }
{% endhighlight %}

Now, we don't have to do this for every single section (or row, because in this case it's only 1 row per section):

{% highlight objc linenos %}
- (CGFloat)tableView:(UITableView *)tableView heightForRowAtIndexPath:(NSIndexPath *)indexPath
{
    CGFloat height = 0;

    // In the spirit of lighter view controllers,
    // the data source is separated out
    // http://www.objc.io/issue-1/lighter-view-controllers.html
    STXFeedTableViewDataSource *dataSource = tableView.dataSource;
    STXPost *post = ([dataSource.posts count] > indexPath.section) ? dataSource.posts[indexPath.section] : nil;

    NSInteger photoRowOffset = 1;
    NSInteger itemRowLimit = photoRowOffset + [post.items count];
    if (indexPath.row == PHOTO_CELL_ROW) {
        height = PhotoCellRowHeight;
    } else if (indexPath.row > PHOTO_CELL_ROW && indexPath.row < itemRowLimit) {
        height = ItemCellRowHeight;
    } else {
        height = [self heightForTableView:tableView contentCellAtIndexPath:indexPath];
    }

    return height;
}
{% endhighlight %}

Let's take a look at the advantage of the above code. First, the boilerplate of Auto Layout size calculation is moved into <code>heightForTableView:contentCellAtIndexPath:</code>. Second, the above code will use a constant height for photo and items because they will not change their height.

Then, the cells corresponding to the photos and items will be re-used normally as we use reuse a standard <code>UITableViewCell</code>.

The feed photo cell:

{% highlight objc %}
- (STXFeedPhotoCell *)photoCellForTableView:(UITableView *)tableView atIndexPath:(NSIndexPath *)indexPath
{
    NSString *CellIdentifier = NSStringFromClass([STXFeedPhotoCell class]);
    STXFeedPhotoCell *cell = [tableView dequeueReusableCellWithIdentifier:CellIdentifier forIndexPath:indexPath];
    cell.selectionStyle = UITableViewCellSelectionStyleNone;
    cell.indexPath = indexPath;

    if (indexPath.section < [self.posts count]) {
        STXPost *post = self.posts[indexPath.section];
        cell.post = post;
        cell.delegate = self.controller;
    }

    return cell;
}
{% endhighlight %}

and the store item cell:

{% highlight objc linenos %}
- (STXStoreItemCell *)itemCellForTableView:(UITableView *)tableView atIndexPath:(NSIndexPath *)indexPath
{
    STXPost *post = ([self.posts count] > indexPath.section) ? self.posts[indexPath.section] : nil;

    NSString *CellIdentifier = NSStringFromClass([STXStoreItemCell class]);
    STXStoreItemCell *cell = [tableView dequeueReusableCellWithIdentifier:CellIdentifier forIndexPath:indexPath];
    cell.selectionStyle = UITableViewCellSelectionStyleNone;
    cell.shouldAddBorders = YES;

    if (indexPath.row < [post.items count]) {
        cell.storeItem = post.items[indexPath.row];
        cell.delegate = self.controller;

        if (indexPath.row == [post.items count] - 1) {
            cell.shouldAddBottomSeparator = YES;
        } else {
            cell.shouldAddBottomSeparator = NO;
        }
    }

    return cell;
}
{% endhighlight %}

We had to add an extra code to determine where to add the borders (because there's no longer a "bordered" container view as a superview of these store item cells), and the separators. So, it's just one of those sacrifices that needs to be done for refactoring a code.

From here, it follows that we can do further optimization by also separating the caption and each comment into its own <code>UITableViewCell</code> subclass.

## Experiment with Instagram Feed

For the purpose of study, we've created a [separate project](https://github.com/2359media/STXDynamicTableView) with the instagram popular media json feed as a content using a table view structure similar to that of Instagram app. This has a much simpler and slightly different feed layout compared to the one we had on the styleXstyle app codebase, because we have to do lots of colors, view margins, and font styling on the real app. But, it's intended to be a bit more generalized (e.g. we've added protocols to support data models for the <code>UITableView</code>'s data source).

If we take a look at the view hierarchy of the instagram inspired table view:

![Instagram inspired dynamic table view](/media/2014-04-16-rebuilding-instagram-feed-table-view/images/stxdynamictableview.png)

As it has been mentioned before we're going to separate likes, caption, and comments. From our [sample code](https://github.com/2359media/STXDynamicTableView/blob/master/STXDynamicTableView/Managers/STXFeedTableViewDelegate.m), it will result in the following height calculation for a table view section:

{% highlight objc linenos %}
- (CGFloat)tableView:(UITableView *)tableView heightForRowAtIndexPath:(NSIndexPath *)indexPath
{
    CGFloat height = 0;
    NSInteger captionRowOffset = 3;
    NSInteger commentsRowLimit = captionRowOffset + MAX_NUMBER_OF_COMMENTS;

    UITableViewCell *cell;
    STXFeedTableViewDataSource *dataSource = tableView.dataSource;

    if (indexPath.row == PHOTO_CELL_ROW) {
        return PhotoCellRowHeight;
    } else if (indexPath.row == LIKES_CELL_ROW) {
        cell = [dataSource likesCellForTableView:tableView atIndexPath:indexPath];
    } else if (indexPath.row == CAPTION_CELL_ROW) {
        cell = [dataSource captionCellForTableView:tableView atIndexPath:indexPath];
    } else if (indexPath.row > CAPTION_CELL_ROW && indexPath.row < commentsRowLimit) {
        NSIndexPath *commentIndexPath = [NSIndexPath indexPathForRow:indexPath.row-captionRowOffset inSection:indexPath.section];
        cell = [dataSource commentCellForTableView:tableView atIndexPath:commentIndexPath];
    } else {
        return UserActionCellHeight;
    }

    [cell setNeedsUpdateConstraints];
    [cell updateConstraintsIfNeeded];

    height = [self heightForTableView:tableView cell:cell atIndexPath:indexPath];
    return height;
}
{% endhighlight %}

Here, we still have two rows which returns static height, and all the other rows still require dynamic height calculation. This is because of the multilines label that are still required for caption, likes, and comments. It might seem that this doesn't reduce the amount of times we need to call <code>-[UIView systemLayoutSizeFittingSize:]</code>, but for each individual row, we have less amount of views that needs to be calculated relative to each other.

As demonstrated with the performance analysis by [Florian Kugler](http://floriankugler.com/blog/2013/4/21/auto-layout-performance-on-ios) and [Martin Pilkington](http://pilky.me/36/), an absolute layout (flat hierarchy of views absolutely positioned relative to a content view) will have less computing overhead compared to relative layout (flat hierarchy of views relatively positioned to each other). We've also managed to reduced nested hierarchy of views that we had in the initial code with store items, likes, and comments container views.

As an example, this is how we've rewritten the comment cell in the previous sample code:

{% highlight objc linenos %}
- (STXCommentCell *)commentCellForTableView:(UITableView *)tableView atIndexPath:(NSIndexPath *)indexPath
{
    id<STXPostItem> post = self.posts[indexPath.section];
    STXCommentCell *cell;

    // We're no longer using a cell loaded from a IB file in this case,
    // because it's more straightforward to use the classic
    // UITableViewCell initWithStyle:reuseIdentifier:
    // for managing initialization of the cell, configuring styles,
    // and reuse identifiers.
    if (indexPath.row == 0 && [post totalComments] > MAX_NUMBER_OF_COMMENTS) {
        static NSString *AllCommentsCellIdentifier = @"STXAllCommentsCell";
        cell = [tableView dequeueReusableCellWithIdentifier:AllCommentsCellIdentifier];

        if (cell == nil) {
            cell = [[STXCommentCell alloc] initWithStyle:STXCommentCellStyleShowAllComments
                                           totalComments:[post totalComments]
                                         reuseIdentifier:AllCommentsCellIdentifier];
        } else {
            cell.totalComments = [post totalComments];
        }

    } else {
        static NSString *CellIdentifier = @"STXSingleCommentCell";
        cell = [tableView dequeueReusableCellWithIdentifier:CellIdentifier];

        NSArray *comments = [post comments];
        id<STXCommentItem> comment = comments[indexPath.row];

        if (indexPath.row < [comments count]) {
            if (cell == nil) {
                cell = [[STXCommentCell alloc] initWithStyle:STXCommentCellStyleSingleComment
                                                     comment:comment
                                             reuseIdentifier:CellIdentifier];
            } else {
                cell.comment = comment;
            }
        }
    }

    cell.delegate = self.controller;

    return cell;
}
{% endhighlight %}

Likes and caption are rewritten in a similar way to comments. Using
<code>UITableViewCell</code>'s <code>initWithStyle:reuseIdentifier:</code> enables us to have more control over the initialization of the cell. Because it's often the case that we're not exactly sure when to pass the individual row text data that's required for multilines label height calculation. So, we wrapped <code>initWithStyle:reuseIdentifier:</code> and pass the required data into it, in order to setup the styles or attributes of the labels.

{% highlight objc linenos %}
- (id)initWithStyle:(STXCommentCellStyle)style comment:(id<STXCommentItem>)comment totalComments:(NSInteger)totalComments reuseIdentifier:(NSString *)reuseIdentifier
{
    self = [super initWithStyle:UITableViewCellStyleDefault reuseIdentifier:reuseIdentifier];
    if (self) {
        _cellStyle = style;

        if (style == STXCommentCellStyleShowAllComments) {
            NSString *title = [NSString stringWithFormat:NSLocalizedString(@"Show %d comments", nil), totalComments];
            _commentLabel = [self allCommentsLabelWithTitle:title];
        } else {
            id<STXUserItem> commenter = [comment from];
            _commentLabel = [self commentLabelWithText:[comment text] commenter:[commenter username]];
        }

        [self.contentView addSubview:_commentLabel];
        _commentLabel.translatesAutoresizingMaskIntoConstraints = NO;

        self.selectionStyle = UITableViewCellSelectionStyleNone;
   }
    return self;
}
{% endhighlight %}

## Wrapping up

<video autoplay="true" loop="true" width="50%"><source src="/media/2014-04-16-rebuilding-instagram-feed-table-view/videos/stylexstyle-feed.m4v" type="video/x-m4v"></source><source src="/media/2014-04-16-rebuilding-instagram-feed-table-view/videos/stylexstyle-feed.webm" type="video/webm"></source></video>

As we can see we've reduced a lot of complexity of the table view code by replicating what Instagram did, with an improvement on scrolling performance. There are a few edge cases here and there but the real work is coming up with such an ingeniously simple and elegant way to solve a problem like this on a mobile device.

