
	
/********************************************
 * 글 읽기 페이지 시작
 ********************************************/
$("#page_list").live("pageinit", function() {
	
	$(this).find("#navigation a").each(function(){
		console.log($(this).text());
		$(this).tap(function(){
			gfn_goToMenu(this);
		});
	});

	
});
